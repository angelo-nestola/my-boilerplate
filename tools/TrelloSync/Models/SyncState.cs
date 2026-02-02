using System.Text.Json.Serialization;

namespace TrelloSync.Models;

public class SyncState
{
    [JsonPropertyName("boardId")]
    public string BoardId { get; set; } = string.Empty;

    [JsonPropertyName("lists")]
    public Dictionary<string, string> Lists { get; set; } = new();

    [JsonPropertyName("cards")]
    public Dictionary<string, string> Cards { get; set; } = new();

    [JsonPropertyName("labels")]
    public Dictionary<string, string> Labels { get; set; } = new();

    [JsonPropertyName("lastSync")]
    public DateTime LastSync { get; set; } = DateTime.UtcNow;

    public string? GetListId(SyncTaskStatus status)
    {
        var key = status.ToYamlString();
        return Lists.TryGetValue(key, out var id) ? id : null;
    }

    public void SetListId(SyncTaskStatus status, string listId)
    {
        Lists[status.ToYamlString()] = listId;
    }

    public string? GetCardId(string taskId)
    {
        return Cards.TryGetValue(taskId, out var id) ? id : null;
    }

    public void SetCardId(string taskId, string cardId)
    {
        Cards[taskId] = cardId;
    }

    public string? GetLabelId(string labelName)
    {
        return Labels.TryGetValue(labelName, out var id) ? id : null;
    }

    public void SetLabelId(string labelName, string labelId)
    {
        Labels[labelName] = labelId;
    }
}
