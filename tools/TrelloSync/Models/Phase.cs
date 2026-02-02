using YamlDotNet.Serialization;

namespace TrelloSync.Models;

public class Phase
{
    [YamlMember(Alias = "id")]
    public string Id { get; set; } = string.Empty;

    [YamlMember(Alias = "name")]
    public string Name { get; set; } = string.Empty;

    [YamlMember(Alias = "tasks")]
    public List<TaskItem> Tasks { get; set; } = new();
}
