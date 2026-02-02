using System.Text.Json;
using TrelloSync.Models;

namespace TrelloSync.Services;

public class SyncService : ISyncService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true
    };

    public SyncState LoadSyncState(string filePath)
    {
        if (!File.Exists(filePath))
        {
            return new SyncState();
        }

        var json = File.ReadAllText(filePath);
        return JsonSerializer.Deserialize<SyncState>(json, JsonOptions) ?? new SyncState();
    }

    public void SaveSyncState(string filePath, SyncState state)
    {
        state.LastSync = DateTime.UtcNow;
        var json = JsonSerializer.Serialize(state, JsonOptions);

        var directory = Path.GetDirectoryName(filePath);
        if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
        {
            Directory.CreateDirectory(directory);
        }

        File.WriteAllText(filePath, json);
    }

    public bool SyncStateExists(string filePath)
    {
        return File.Exists(filePath);
    }

    public async Task<SyncDiff> ComputeDiffAsync(TaskPlan plan, SyncState state, ITrelloClientWrapper trelloClient)
    {
        var diff = new SyncDiff();

        if (string.IsNullOrEmpty(state.BoardId))
        {
            // No board initialized, all tasks are new
            diff.NewTasks.AddRange(plan.GetAllTasks());
            return diff;
        }

        // Get current cards from Trello
        var trelloCards = await trelloClient.GetBoardCardsAsync(state.BoardId);
        var trelloLists = await trelloClient.GetBoardListsAsync(state.BoardId);

        var cardIdToListId = trelloCards.ToDictionary(c => c.Id, c => c.ListId);
        var listIdToStatus = trelloLists.ToDictionary(
            l => l.Id,
            l => SyncTaskStatusExtensions.FromTrelloListName(l.Name));

        foreach (var task in plan.GetAllTasks())
        {
            var cardId = state.GetCardId(task.Id);

            if (cardId == null)
            {
                // New task
                diff.NewTasks.Add(task);
            }
            else if (cardIdToListId.TryGetValue(cardId, out var currentListId))
            {
                // Check if card moved (status changed on Trello)
                var trelloStatus = listIdToStatus.GetValueOrDefault(currentListId, SyncTaskStatus.Backlog);

                if (trelloStatus != task.Status)
                {
                    diff.StatusChanges.Add((task, task.Status, trelloStatus));
                }
            }
        }

        // Find orphaned cards (cards on Trello not in plan)
        var planTaskIds = plan.GetAllTasks().Select(t => t.Id).ToHashSet();
        foreach (var (taskId, cardId) in state.Cards)
        {
            if (!planTaskIds.Contains(taskId))
            {
                diff.OrphanedCardIds.Add(cardId);
            }
        }

        return diff;
    }
}
