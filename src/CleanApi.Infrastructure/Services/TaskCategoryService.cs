using CleanApi.Application.Common.Interfaces;
using CleanApi.Application.Common.Models;
using CleanApi.Application.Features.TaskCategories;
using CleanApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CleanApi.Infrastructure.Services;

/// <summary>
/// Implementation of ITaskCategoryService.
/// </summary>
public class TaskCategoryService : ITaskCategoryService
{
    private readonly IApplicationDbContext _context;

    public TaskCategoryService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IEnumerable<TaskCategoryDto>>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var categories = await _context.TaskCategories
            .AsNoTracking()
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .ToListAsync(cancellationToken);

        return Result<IEnumerable<TaskCategoryDto>>.Success(categories.Select(MapToDto));
    }

    public async Task<Result<IEnumerable<TaskCategoryTreeDto>>> GetTreeAsync(CancellationToken cancellationToken = default)
    {
        var categories = await _context.TaskCategories
            .AsNoTracking()
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .ToListAsync(cancellationToken);

        var tree = BuildTree(categories, null);
        return Result<IEnumerable<TaskCategoryTreeDto>>.Success(tree);
    }

    public async Task<Result<TaskCategoryDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var category = await _context.TaskCategories
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (category == null)
        {
            return Result<TaskCategoryDto>.Failure("Category not found");
        }

        return Result<TaskCategoryDto>.Success(MapToDto(category));
    }

    public async Task<Result<TaskCategoryDto>> CreateAsync(CreateTaskCategoryDto dto, CancellationToken cancellationToken = default)
    {
        // Validate parent exists if specified
        if (dto.ParentId.HasValue)
        {
            var parentExists = await _context.TaskCategories
                .AnyAsync(c => c.Id == dto.ParentId.Value, cancellationToken);

            if (!parentExists)
            {
                return Result<TaskCategoryDto>.Failure("Parent category not found");
            }
        }

        // Check for duplicate name at same level
        var duplicateExists = await _context.TaskCategories
            .AnyAsync(c => c.Name == dto.Name && c.ParentId == dto.ParentId, cancellationToken);

        if (duplicateExists)
        {
            return Result<TaskCategoryDto>.Failure("A category with this name already exists at this level");
        }

        var category = new TaskCategory
        {
            Name = dto.Name,
            Description = dto.Description,
            Color = dto.Color,
            Icon = dto.Icon,
            SortOrder = dto.SortOrder,
            ParentId = dto.ParentId
        };

        _context.TaskCategories.Add(category);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<TaskCategoryDto>.Success(MapToDto(category));
    }

    public async Task<Result<TaskCategoryDto>> UpdateAsync(Guid id, UpdateTaskCategoryDto dto, CancellationToken cancellationToken = default)
    {
        var category = await _context.TaskCategories
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (category == null)
        {
            return Result<TaskCategoryDto>.Failure("Category not found");
        }

        // Validate parent if changing
        if (dto.ParentId.HasValue && dto.ParentId != category.ParentId)
        {
            // Prevent circular reference
            if (dto.ParentId.Value == id)
            {
                return Result<TaskCategoryDto>.Failure("A category cannot be its own parent");
            }

            // Check if new parent is a descendant (would create circular ref)
            if (await IsDescendantAsync(dto.ParentId.Value, id, cancellationToken))
            {
                return Result<TaskCategoryDto>.Failure("Cannot move a category under its own descendant");
            }

            var parentExists = await _context.TaskCategories
                .AnyAsync(c => c.Id == dto.ParentId.Value, cancellationToken);

            if (!parentExists)
            {
                return Result<TaskCategoryDto>.Failure("Parent category not found");
            }
        }

        // Check for duplicate name at same level
        var newParentId = dto.ParentId ?? category.ParentId;
        var newName = dto.Name ?? category.Name;

        var duplicateExists = await _context.TaskCategories
            .AnyAsync(c => c.Id != id && c.Name == newName && c.ParentId == newParentId, cancellationToken);

        if (duplicateExists)
        {
            return Result<TaskCategoryDto>.Failure("A category with this name already exists at this level");
        }

        if (dto.Name != null) category.Name = dto.Name;
        if (dto.Description != null) category.Description = dto.Description;
        if (dto.Color != null) category.Color = dto.Color;
        if (dto.Icon != null) category.Icon = dto.Icon;
        if (dto.SortOrder.HasValue) category.SortOrder = dto.SortOrder.Value;
        if (dto.ParentId.HasValue) category.ParentId = dto.ParentId.Value == Guid.Empty ? null : dto.ParentId;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<TaskCategoryDto>.Success(MapToDto(category));
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var category = await _context.TaskCategories
            .Include(c => c.Children)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (category == null)
        {
            return Result.Failure("Category not found");
        }

        // Check if has children
        if (category.Children.Any())
        {
            return Result.Failure("Cannot delete a category with subcategories. Delete subcategories first.");
        }

        // Check if has tasks (soft delete will handle this, but let's warn)
        var hasTasks = await _context.ProjectTasks
            .AnyAsync(t => t.CategoryId == id, cancellationToken);

        if (hasTasks)
        {
            return Result.Failure("Cannot delete a category with tasks. Reassign tasks first.");
        }

        _context.TaskCategories.Remove(category);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    private async Task<bool> IsDescendantAsync(Guid potentialDescendantId, Guid ancestorId, CancellationToken cancellationToken)
    {
        var currentId = potentialDescendantId;
        var visited = new HashSet<Guid>();

        while (currentId != Guid.Empty)
        {
            if (!visited.Add(currentId))
            {
                // Circular reference detected
                break;
            }

            var category = await _context.TaskCategories
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == currentId, cancellationToken);

            if (category == null || !category.ParentId.HasValue)
            {
                return false;
            }

            if (category.ParentId.Value == ancestorId)
            {
                return true;
            }

            currentId = category.ParentId.Value;
        }

        return false;
    }

    private static IEnumerable<TaskCategoryTreeDto> BuildTree(IEnumerable<TaskCategory> categories, Guid? parentId)
    {
        return categories
            .Where(c => c.ParentId == parentId)
            .Select(c => new TaskCategoryTreeDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                Color = c.Color,
                Icon = c.Icon,
                SortOrder = c.SortOrder,
                ParentId = c.ParentId,
                Children = BuildTree(categories, c.Id)
            })
            .ToList();
    }

    private static TaskCategoryDto MapToDto(TaskCategory category)
    {
        return new TaskCategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            Color = category.Color,
            Icon = category.Icon,
            SortOrder = category.SortOrder,
            ParentId = category.ParentId,
            CreatedAt = category.CreatedAt,
            UpdatedAt = category.UpdatedAt
        };
    }
}
