using TrelloSync.Configuration;
using TrelloSync.Models;
using TrelloSync.Services;

namespace TrelloSync.Commands;

public class PushCommand
{
    private readonly IYamlParser _yamlParser;
    private readonly ITrelloClientWrapper _trelloClient;
    private readonly ISyncService _syncService;
    private readonly PathSettings _pathSettings;

    private static readonly string[] LabelColors = { "green", "yellow", "orange", "red", "purple", "blue", "sky", "lime", "pink", "black" };

    public PushCommand(
        IYamlParser yamlParser,
        ITrelloClientWrapper trelloClient,
        ISyncService syncService,
        PathSettings pathSettings)
    {
        _yamlParser = yamlParser;
        _trelloClient = trelloClient;
        _syncService = syncService;
        _pathSettings = pathSettings;
    }

    public async Task ExecuteAsync()
    {
        var planPath = _pathSettings.GetPlanFilePath();
        var syncStatePath = _pathSettings.GetSyncStateFilePath();

        // Check initialization
        if (!_syncService.SyncStateExists(syncStatePath))
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("Board not initialized. Run 'init' command first.");
            Console.ResetColor();
            return;
        }

        // Check plan file exists
        if (!File.Exists(planPath))
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"Plan file not found: {planPath}");
            Console.ResetColor();
            return;
        }

        var state = _syncService.LoadSyncState(syncStatePath);
        var plan = _yamlParser.ParsePlan(planPath);

        Console.WriteLine($"Syncing {plan.Project} to Trello...\n");

        var createdCount = 0;
        var updatedCount = 0;
        var skippedCount = 0;

        // Ensure labels exist for phases
        var colorIndex = 0;
        foreach (var phase in plan.Phases)
        {
            if (state.GetLabelId(phase.Id) == null)
            {
                var color = LabelColors[colorIndex % LabelColors.Length];
                var labelId = await _trelloClient.CreateLabelAsync(state.BoardId, phase.Name, color);
                state.SetLabelId(phase.Id, labelId);
                Console.WriteLine($"Created label: {phase.Name}");
                colorIndex++;
            }
        }

        // Process each task
        foreach (var phase in plan.Phases)
        {
            Console.WriteLine($"\n[{phase.Name}]");

            foreach (var task in phase.Tasks)
            {
                var existingCardId = state.GetCardId(task.Id);
                var listId = state.GetListId(task.Status);

                if (listId == null)
                {
                    Console.ForegroundColor = ConsoleColor.Yellow;
                    Console.WriteLine($"  Warning: No list found for status '{task.Status}'. Skipping {task.Id}");
                    Console.ResetColor();
                    skippedCount++;
                    continue;
                }

                var labelIds = new List<string>();
                var phaseLabelId = state.GetLabelId(phase.Id);
                if (phaseLabelId != null)
                {
                    labelIds.Add(phaseLabelId);
                }

                // Add custom labels
                foreach (var label in task.Labels)
                {
                    var labelId = state.GetLabelId(label);
                    if (labelId == null)
                    {
                        // Create new label
                        var color = LabelColors[(colorIndex++) % LabelColors.Length];
                        labelId = await _trelloClient.CreateLabelAsync(state.BoardId, label, color);
                        state.SetLabelId(label, labelId);
                    }
                    labelIds.Add(labelId);
                }

                if (existingCardId == null)
                {
                    // Create new card
                    var cardId = await _trelloClient.CreateCardAsync(
                        listId,
                        task.Title,
                        task.Description,
                        labelIds,
                        task.Subtasks);

                    state.SetCardId(task.Id, cardId);

                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine($"  + {task.Title}");
                    Console.ResetColor();
                    createdCount++;
                }
                else
                {
                    // Update existing card
                    await _trelloClient.UpdateCardAsync(existingCardId, task.Title, task.Description);
                    await _trelloClient.MoveCardToListAsync(existingCardId, listId);

                    if (task.Subtasks.Count > 0)
                    {
                        await _trelloClient.UpdateChecklistAsync(existingCardId, task.Subtasks);
                    }

                    Console.ForegroundColor = ConsoleColor.Cyan;
                    Console.WriteLine($"  ~ {task.Title}");
                    Console.ResetColor();
                    updatedCount++;
                }
            }
        }

        // Save updated state
        _syncService.SaveSyncState(syncStatePath, state);

        // Summary
        Console.WriteLine("\n" + new string('-', 40));
        Console.WriteLine($"Created: {createdCount}");
        Console.WriteLine($"Updated: {updatedCount}");
        if (skippedCount > 0)
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine($"Skipped: {skippedCount}");
            Console.ResetColor();
        }
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine("\nSync completed successfully!");
        Console.ResetColor();
    }
}
