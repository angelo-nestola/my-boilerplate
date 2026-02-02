namespace TrelloSync.Configuration;

public class TrelloSettings
{
    public string ApiKey { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public string BoardName { get; set; } = "CleanApi";
}

public class PathSettings
{
    public string TasksFolder { get; set; } = "tasks";
    public string PlanFile { get; set; } = "plan.yaml";
    public string SyncStateFile { get; set; } = ".trello-sync.json";

    public string GetPlanFilePath() => Path.Combine(Environment.CurrentDirectory, TasksFolder, PlanFile);
    public string GetSyncStateFilePath() => Path.Combine(Environment.CurrentDirectory, TasksFolder, SyncStateFile);
}
