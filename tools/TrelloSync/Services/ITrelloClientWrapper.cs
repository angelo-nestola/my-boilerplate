using TrelloSync.Models;

namespace TrelloSync.Services;

public interface ITrelloClientWrapper
{
    Task<string> CreateBoardAsync(string name);
    Task<string> CreateListAsync(string boardId, string name, int position);
    Task<string> CreateLabelAsync(string boardId, string name, string color);
    Task<string> CreateCardAsync(string listId, string name, string? description, List<string>? labelIds, List<string>? checklistItems);
    Task UpdateCardAsync(string cardId, string name, string? description);
    Task MoveCardToListAsync(string cardId, string listId);
    Task<string?> GetBoardIdByNameAsync(string name);
    Task<List<TrelloList>> GetBoardListsAsync(string boardId);
    Task<List<TrelloCard>> GetBoardCardsAsync(string boardId);
    Task<List<TrelloLabel>> GetBoardLabelsAsync(string boardId);
    Task AddLabelsToCardAsync(string cardId, List<string> labelIds);
    Task UpdateChecklistAsync(string cardId, List<string> checklistItems);
}

public record TrelloList(string Id, string Name);
public record TrelloCard(string Id, string Name, string ListId, string? Description, List<string> LabelIds);
public record TrelloLabel(string Id, string Name, string Color);
