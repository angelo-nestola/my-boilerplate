using TrelloSync.Configuration;
using TrelloSync.Models;
using TrelloSync.Services;

namespace TrelloSync.Commands;

public class InitCommand
{
    private readonly ITrelloClientWrapper _trelloClient;
    private readonly ISyncService _syncService;
    private readonly TrelloSettings _trelloSettings;
    private readonly PathSettings _pathSettings;

    public InitCommand(
        ITrelloClientWrapper trelloClient,
        ISyncService syncService,
        TrelloSettings trelloSettings,
        PathSettings pathSettings)
    {
        _trelloClient = trelloClient;
        _syncService = syncService;
        _trelloSettings = trelloSettings;
        _pathSettings = pathSettings;
    }

    public async Task ExecuteAsync()
    {
        var syncStatePath = _pathSettings.GetSyncStateFilePath();

        // Check if already initialized
        if (_syncService.SyncStateExists(syncStatePath))
        {
            var existingState = _syncService.LoadSyncState(syncStatePath);
            if (!string.IsNullOrEmpty(existingState.BoardId))
            {
                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.WriteLine($"Board already initialized. Board ID: {existingState.BoardId}");
                Console.ResetColor();
                Console.WriteLine("To reinitialize, delete the .trello-sync.json file first.");
                return;
            }
        }

        Console.WriteLine($"Initializing Trello board: {_trelloSettings.BoardName}");

        var state = new SyncState();

        // Check if board already exists
        var existingBoardId = await _trelloClient.GetBoardIdByNameAsync(_trelloSettings.BoardName);
        if (existingBoardId != null)
        {
            Console.WriteLine($"Found existing board with name '{_trelloSettings.BoardName}'");
            state.BoardId = existingBoardId;

            // Load existing lists
            var lists = await _trelloClient.GetBoardListsAsync(existingBoardId);
            foreach (var list in lists)
            {
                var status = SyncTaskStatusExtensions.FromTrelloListName(list.Name);
                state.SetListId(status, list.Id);
                Console.WriteLine($"  Found list: {list.Name}");
            }

            // Load existing labels
            var labels = await _trelloClient.GetBoardLabelsAsync(existingBoardId);
            foreach (var label in labels.Where(l => !string.IsNullOrEmpty(l.Name)))
            {
                state.SetLabelId(label.Name, label.Id);
                Console.WriteLine($"  Found label: {label.Name}");
            }
        }
        else
        {
            // Create new board
            Console.WriteLine("Creating new board...");
            state.BoardId = await _trelloClient.CreateBoardAsync(_trelloSettings.BoardName);

            // Create lists (in reverse order so they appear correctly)
            var statuses = new[] { SyncTaskStatus.Done, SyncTaskStatus.InProgress, SyncTaskStatus.Todo, SyncTaskStatus.Backlog };
            var position = 1;
            foreach (var status in statuses)
            {
                var listName = status.ToTrelloListName();
                Console.WriteLine($"  Creating list: {listName}");
                var listId = await _trelloClient.CreateListAsync(state.BoardId, listName, position++);
                state.SetListId(status, listId);
            }
        }

        // Save sync state
        _syncService.SaveSyncState(syncStatePath, state);

        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine($"\nBoard initialized successfully!");
        Console.ResetColor();
        Console.WriteLine($"Board ID: {state.BoardId}");
        Console.WriteLine($"Sync state saved to: {syncStatePath}");
    }
}
