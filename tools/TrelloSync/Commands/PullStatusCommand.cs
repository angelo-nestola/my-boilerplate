using TrelloSync.Configuration;
using TrelloSync.Models;
using TrelloSync.Services;

namespace TrelloSync.Commands;

public class PullStatusCommand
{
    private readonly IYamlParser _yamlParser;
    private readonly ITrelloClientWrapper _trelloClient;
    private readonly ISyncService _syncService;
    private readonly PathSettings _pathSettings;

    public PullStatusCommand(
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

    public async Task ExecuteAsync(bool apply)
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

        Console.WriteLine($"Pulling status from Trello for {plan.Project}...\n");

        var diff = await _syncService.ComputeDiffAsync(plan, state, _trelloClient);

        if (diff.StatusChanges.Count == 0)
        {
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("All task statuses are in sync with Trello!");
            Console.ResetColor();
            return;
        }

        Console.WriteLine($"Found {diff.StatusChanges.Count} status change(s):\n");

        foreach (var (task, oldStatus, newStatus) in diff.StatusChanges)
        {
            Console.Write($"  [{task.Id}] {task.Title}: ");
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.Write(oldStatus.ToYamlString());
            Console.ResetColor();
            Console.Write(" -> ");
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine(newStatus.ToYamlString());
            Console.ResetColor();
        }

        if (!apply)
        {
            Console.WriteLine();
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine("Run with --apply to update plan.yaml with these changes.");
            Console.ResetColor();
            return;
        }

        // Apply changes
        Console.WriteLine("\nApplying changes to plan.yaml...");

        foreach (var (task, _, newStatus) in diff.StatusChanges)
        {
            var planTask = plan.GetTaskById(task.Id);
            if (planTask != null)
            {
                planTask.Status = newStatus;
            }
        }

        _yamlParser.SavePlan(planPath, plan);

        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine($"\nUpdated {diff.StatusChanges.Count} task(s) in plan.yaml");
        Console.ResetColor();
    }
}
