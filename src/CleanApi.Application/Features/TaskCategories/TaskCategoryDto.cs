namespace CleanApi.Application.Features.TaskCategories;

/// <summary>
/// DTO representing a task category.
/// </summary>
public record TaskCategoryDto
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }
    public string? Color { get; init; }
    public string? Icon { get; init; }
    public int SortOrder { get; init; }
    public Guid? ParentId { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

/// <summary>
/// DTO representing a task category with its children (tree structure).
/// </summary>
public record TaskCategoryTreeDto
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }
    public string? Color { get; init; }
    public string? Icon { get; init; }
    public int SortOrder { get; init; }
    public Guid? ParentId { get; init; }
    public IEnumerable<TaskCategoryTreeDto> Children { get; init; } = [];
}

/// <summary>
/// DTO for creating a new task category.
/// </summary>
public record CreateTaskCategoryDto
{
    public required string Name { get; init; }
    public string? Description { get; init; }
    public string? Color { get; init; }
    public string? Icon { get; init; }
    public int SortOrder { get; init; }
    public Guid? ParentId { get; init; }
}

/// <summary>
/// DTO for updating a task category.
/// </summary>
public record UpdateTaskCategoryDto
{
    public string? Name { get; init; }
    public string? Description { get; init; }
    public string? Color { get; init; }
    public string? Icon { get; init; }
    public int? SortOrder { get; init; }
    public Guid? ParentId { get; init; }
}
