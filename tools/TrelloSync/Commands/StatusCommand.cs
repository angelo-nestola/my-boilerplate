using TrelloSync.Configuration;
using TrelloSync.Models;
using TrelloSync.Services;

namespace TrelloSync.Commands;

public class StatusCommand
{
    private readonly IYamlParser _yamlParser;
    private readonly ITrelloClientWrapper _trelloClient;
    private readonly ISyncService _syncService;
    private readonly PathSettings _pathSettings;

    public StatusCommand(
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

        Console.WriteLine($"Status for {plan.Project}\n");
        Console.WriteLine($"Last sync: {state.LastSync:yyyy-MM-dd HH:mm:ss} UTC\n");

        var diff = await _syncService.ComputeDiffAsync(plan, state, _trelloClient);

        if (!diff.HasChanges && diff.OrphanedCardIds.Count == 0)
        {
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("All tasks are in sync!");
            Console.ResetColor();
            return;
        }

        // New tasks (not on Trello)
        if (diff.NewTasks.Count > 0)
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine($"New tasks (not on Trello): {diff.NewTasks.Count}");
            Console.ResetColor();
            foreach (var task in diff.NewTasks)
            {
                Console.WriteLine($"  + [{task.Id}] {task.Title}");
            }
            Console.WriteLine();
        }

        // Status changes (card moved on Trello)
        if (diff.StatusChanges.Count > 0)
        {
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine($"Status changes on Trello: {diff.StatusChanges.Count}");
            Console.ResetColor();
            foreach (var (task, oldStatus, newStatus) in diff.StatusChanges)
            {
                Console.WriteLine($"  ~ [{task.Id}] {task.Title}");
                Console.WriteLine($"    Local: {oldStatus.ToYamlString()} -> Trello: {newStatus.ToYamlString()}");
            }
            Console.WriteLine();
        }

        // Orphaned cards
        if (diff.OrphanedCardIds.Count > 0)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"Orphaned cards (on Trello but not in plan): {diff.OrphanedCardIds.Count}");
            Console.ResetColor();
            foreach (var cardId in diff.OrphanedCardIds)
            {
                Console.WriteLine($"  ? Card ID: {cardId}");
            }
            Console.WriteLine();
        }

        // Summary
        Console.WriteLine(new string('-', 40));
        Console.WriteLine("Actions needed:");
        if (diff.NewTasks.Count > 0)
        {
            Console.WriteLine($"  - Run 'push' to create {diff.NewTasks.Count} new cards");
        }
        if (diff.StatusChanges.Count > 0)
        {
            Console.WriteLine($"  - Run 'pull-status --apply' to update {diff.StatusChanges.Count} task statuses locally");
        }
    }
}
