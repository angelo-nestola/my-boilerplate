using TrelloSync.Models;

namespace TrelloSync.Services;

public interface ISyncService
{
    SyncState LoadSyncState(string filePath);
    void SaveSyncState(string filePath, SyncState state);
    bool SyncStateExists(string filePath);
    Task<SyncDiff> ComputeDiffAsync(TaskPlan plan, SyncState state, ITrelloClientWrapper trelloClient);
}

public class SyncDiff
{
    public List<TaskItem> NewTasks { get; set; } = new();
    public List<TaskItem> UpdatedTasks { get; set; } = new();
    public List<(TaskItem Task, SyncTaskStatus OldStatus, SyncTaskStatus NewStatus)> StatusChanges { get; set; } = new();
    public List<string> OrphanedCardIds { get; set; } = new();

    public bool HasChanges => NewTasks.Count > 0 || UpdatedTasks.Count > 0 || StatusChanges.Count > 0;
}
