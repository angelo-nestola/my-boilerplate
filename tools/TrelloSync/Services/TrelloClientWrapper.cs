using TrelloDotNet;
using TrelloDotNet.Model;
using TrelloSync.Configuration;

namespace TrelloSync.Services;

public class TrelloClientWrapper : ITrelloClientWrapper
{
    private readonly TrelloClient _client;

    public TrelloClientWrapper(TrelloSettings settings)
    {
        if (string.IsNullOrEmpty(settings.ApiKey) || string.IsNullOrEmpty(settings.Token))
        {
            throw new InvalidOperationException(
                "Trello API credentials not configured. Please set ApiKey and Token in appsettings.Development.json");
        }

        _client = new TrelloClient(settings.ApiKey, settings.Token);
    }

    public async Task<string> CreateBoardAsync(string name)
    {
        var board = await _client.AddBoardAsync(new Board(name));
        return board.Id;
    }

    public async Task<string> CreateListAsync(string boardId, string name, int position)
    {
        var list = await _client.AddListAsync(new List(name, boardId) { Position = position });
        return list.Id;
    }

    public async Task<string> CreateLabelAsync(string boardId, string name, string color)
    {
        var label = await _client.AddLabelAsync(new Label(boardId, name, color));
        return label.Id;
    }

    public async Task<string> CreateCardAsync(string listId, string name, string? description, List<string>? labelIds, List<string>? checklistItems)
    {
        var card = new Card(listId, name)
        {
            Description = description
        };

        var createdCard = await _client.AddCardAsync(card);

        // Add labels to card
        if (labelIds != null && labelIds.Count > 0)
        {
            foreach (var labelId in labelIds)
            {
                try
                {
                    await _client.AddLabelsToCardAsync(createdCard.Id, labelId);
                }
                catch
                {
                    // Ignore label errors
                }
            }
        }

        // Add checklist with items
        if (checklistItems != null && checklistItems.Count > 0)
        {
            var checklist = new Checklist("Subtasks");
            checklist.Items = checklistItems.Select(item => new ChecklistItem(item)).ToList();
            await _client.AddChecklistAsync(createdCard.Id, checklist);
        }

        return createdCard.Id;
    }

    public async Task UpdateCardAsync(string cardId, string name, string? description)
    {
        var card = await _client.GetCardAsync(cardId);
        card.Name = name;
        card.Description = description;
        await _client.UpdateCardAsync(card);
    }

    public async Task MoveCardToListAsync(string cardId, string listId)
    {
        var card = await _client.GetCardAsync(cardId);
        card.ListId = listId;
        await _client.UpdateCardAsync(card);
    }

    public async Task<string?> GetBoardIdByNameAsync(string name)
    {
        var boards = await _client.GetBoardsCurrentTokenCanAccessAsync();
        var board = boards.FirstOrDefault(b => b.Name.Equals(name, StringComparison.OrdinalIgnoreCase));
        return board?.Id;
    }

    public async Task<List<TrelloList>> GetBoardListsAsync(string boardId)
    {
        var lists = await _client.GetListsOnBoardAsync(boardId);
        return lists.Select(l => new TrelloList(l.Id, l.Name)).ToList();
    }

    public async Task<List<TrelloCard>> GetBoardCardsAsync(string boardId)
    {
        var cards = await _client.GetCardsOnBoardAsync(boardId);
        return cards.Select(c => new TrelloCard(
            c.Id,
            c.Name,
            c.ListId,
            c.Description,
            c.LabelIds?.ToList() ?? new List<string>()
        )).ToList();
    }

    public async Task<List<TrelloLabel>> GetBoardLabelsAsync(string boardId)
    {
        var labels = await _client.GetLabelsOfBoardAsync(boardId);
        return labels.Select(l => new TrelloLabel(l.Id, l.Name ?? string.Empty, l.Color ?? string.Empty)).ToList();
    }

    public async Task AddLabelsToCardAsync(string cardId, List<string> labelIds)
    {
        foreach (var labelId in labelIds)
        {
            try
            {
                await _client.AddLabelsToCardAsync(cardId, labelId);
            }
            catch
            {
                // Ignore label errors
            }
        }
    }

    public async Task UpdateChecklistAsync(string cardId, List<string> checklistItems)
    {
        var checklists = await _client.GetChecklistsOnCardAsync(cardId);
        var existingChecklist = checklists.FirstOrDefault(c => c.Name == "Subtasks");

        if (existingChecklist != null)
        {
            await _client.DeleteChecklistAsync(existingChecklist.Id);
        }

        if (checklistItems.Count > 0)
        {
            var checklist = new Checklist("Subtasks");
            checklist.Items = checklistItems.Select(item => new ChecklistItem(item)).ToList();
            await _client.AddChecklistAsync(cardId, checklist);
        }
    }
}
