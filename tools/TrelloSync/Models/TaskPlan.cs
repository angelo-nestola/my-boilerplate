using YamlDotNet.Serialization;

namespace TrelloSync.Models;

public class TaskPlan
{
    [YamlMember(Alias = "project")]
    public string Project { get; set; } = string.Empty;

    [YamlMember(Alias = "version")]
    public string Version { get; set; } = "1.0";

    [YamlMember(Alias = "phases")]
    public List<Phase> Phases { get; set; } = new();

    public IEnumerable<TaskItem> GetAllTasks()
    {
        return Phases.SelectMany(p => p.Tasks);
    }

    public TaskItem? GetTaskById(string taskId)
    {
        return GetAllTasks().FirstOrDefault(t => t.Id == taskId);
    }

    public Phase? GetPhaseForTask(string taskId)
    {
        return Phases.FirstOrDefault(p => p.Tasks.Any(t => t.Id == taskId));
    }
}
