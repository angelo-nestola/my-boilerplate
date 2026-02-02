using YamlDotNet.Serialization;

namespace TrelloSync.Models;

public class TaskItem
{
    [YamlMember(Alias = "id")]
    public string Id { get; set; } = string.Empty;

    [YamlMember(Alias = "title")]
    public string Title { get; set; } = string.Empty;

    [YamlMember(Alias = "description")]
    public string? Description { get; set; }

    [YamlMember(Alias = "status")]
    public string StatusString { get; set; } = "backlog";

    [YamlIgnore]
    public SyncTaskStatus Status
    {
        get => SyncTaskStatusExtensions.FromYamlString(StatusString);
        set => StatusString = value.ToYamlString();
    }

    [YamlMember(Alias = "labels")]
    public List<string> Labels { get; set; } = new();

    [YamlMember(Alias = "subtasks")]
    public List<string> Subtasks { get; set; } = new();
}
