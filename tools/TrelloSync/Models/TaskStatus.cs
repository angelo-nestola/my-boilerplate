namespace TrelloSync.Models;

public enum SyncTaskStatus
{
    Backlog,
    Todo,
    InProgress,
    Done
}

public static class SyncTaskStatusExtensions
{
    public static string ToYamlString(this SyncTaskStatus status) => status switch
    {
        SyncTaskStatus.Backlog => "backlog",
        SyncTaskStatus.Todo => "todo",
        SyncTaskStatus.InProgress => "in_progress",
        SyncTaskStatus.Done => "done",
        _ => "backlog"
    };

    public static SyncTaskStatus FromYamlString(string? value) => value?.ToLowerInvariant() switch
    {
        "backlog" => SyncTaskStatus.Backlog,
        "todo" => SyncTaskStatus.Todo,
        "in_progress" => SyncTaskStatus.InProgress,
        "done" => SyncTaskStatus.Done,
        _ => SyncTaskStatus.Backlog
    };

    public static string ToTrelloListName(this SyncTaskStatus status) => status switch
    {
        SyncTaskStatus.Backlog => "Backlog",
        SyncTaskStatus.Todo => "To Do",
        SyncTaskStatus.InProgress => "In Progress",
        SyncTaskStatus.Done => "Done",
        _ => "Backlog"
    };

    public static SyncTaskStatus FromTrelloListName(string listName) => listName switch
    {
        "Backlog" => SyncTaskStatus.Backlog,
        "To Do" => SyncTaskStatus.Todo,
        "In Progress" => SyncTaskStatus.InProgress,
        "Done" => SyncTaskStatus.Done,
        _ => SyncTaskStatus.Backlog
    };
}
