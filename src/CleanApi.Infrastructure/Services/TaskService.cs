using CleanApi.Application.Common.Interfaces;
using CleanApi.Application.Common.Models;
using CleanApi.Application.Features.Tasks;
using CleanApi.Domain.Entities;
using CleanApi.Domain.Enums;
using CleanApi.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace CleanApi.Infrastructure.Services;

/// <summary>
/// Implementation of ITaskService.
/// </summary>
public class TaskService : ITaskService
{
    private readonly IApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ICurrentUserService _currentUserService;

    public TaskService(
        IApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _userManager = userManager;
        _currentUserService = currentUserService;
    }

    public async Task<Result<IEnumerable<TaskListDto>>> GetAllAsync(
        Guid? projectId = null,
        string? assigneeId = null,
        ProjectTaskStatus? status = null,
        TaskPriority? priority = null,
        string? searchTerm = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.ProjectTasks
            .AsNoTracking()
            .Include(t => t.Project)
            .Include(t => t.Category)
            .AsQueryable();

        if (projectId.HasValue)
        {
            query = query.Where(t => t.ProjectId == projectId.Value);
        }

        if (!string.IsNullOrEmpty(assigneeId))
        {
            query = query.Where(t => t.AssigneeId == assigneeId);
        }

        if (status.HasValue)
        {
            query = query.Where(t => t.Status == status.Value);
        }

        if (priority.HasValue)
        {
            query = query.Where(t => t.Priority == priority.Value);
        }

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var search = searchTerm.ToLower();
            query = query.Where(t =>
                t.Title.ToLower().Contains(search) ||
                (t.Description != null && t.Description.ToLower().Contains(search)));
        }

        var tasks = await query
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);

        var dtos = new List<TaskListDto>();
        foreach (var task in tasks)
        {
            string? assigneeName = null;
            if (!string.IsNullOrEmpty(task.AssigneeId))
            {
                var user = await _userManager.FindByIdAsync(task.AssigneeId);
                assigneeName = user != null ? GetFullName(user) : null;
            }

            dtos.Add(new TaskListDto
            {
                Id = task.Id,
                ProjectId = task.ProjectId,
                ProjectCode = task.Project?.Code,
                TaskNumber = task.TaskNumber,
                Title = task.Title,
                Status = task.Status,
                Priority = task.Priority,
                CategoryName = task.Category?.Name,
                AssigneeName = assigneeName,
                DueDate = task.DueDate
            });
        }

        return Result<IEnumerable<TaskListDto>>.Success(dtos);
    }

    public async Task<Result<IEnumerable<TaskListDto>>> GetMyTasksAsync(CancellationToken cancellationToken = default)
    {
        var userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            return Result<IEnumerable<TaskListDto>>.Failure("User not authenticated");
        }

        return await GetAllAsync(assigneeId: userId, cancellationToken: cancellationToken);
    }

    public async Task<Result<TaskDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var task = await _context.ProjectTasks
            .AsNoTracking()
            .Include(t => t.Project)
            .Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

        if (task == null)
        {
            return Result<TaskDto>.Failure("Task not found");
        }

        return Result<TaskDto>.Success(await MapToDto(task));
    }

    public async Task<Result<TaskDto>> CreateAsync(CreateTaskDto dto, CancellationToken cancellationToken = default)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == dto.ProjectId, cancellationToken);

        if (project == null)
        {
            return Result<TaskDto>.Failure("Project not found");
        }

        // Validate category if provided
        if (dto.CategoryId.HasValue)
        {
            var categoryExists = await _context.TaskCategories
                .AnyAsync(c => c.Id == dto.CategoryId.Value, cancellationToken);

            if (!categoryExists)
            {
                return Result<TaskDto>.Failure("Category not found");
            }
        }

        // Validate assignee if provided
        if (!string.IsNullOrEmpty(dto.AssigneeId))
        {
            var user = await _userManager.FindByIdAsync(dto.AssigneeId);
            if (user == null)
            {
                return Result<TaskDto>.Failure("Assignee not found");
            }
        }

        // Get next task number for project
        var maxTaskNumber = await _context.ProjectTasks
            .Where(t => t.ProjectId == dto.ProjectId)
            .MaxAsync(t => (int?)t.TaskNumber, cancellationToken) ?? 0;

        var task = new ProjectTask
        {
            ProjectId = dto.ProjectId,
            TaskNumber = maxTaskNumber + 1,
            Title = dto.Title,
            Description = dto.Description,
            Status = dto.Status,
            Priority = dto.Priority,
            CategoryId = dto.CategoryId,
            AssigneeId = dto.AssigneeId,
            EstimatedHours = dto.EstimatedHours,
            DueDate = dto.DueDate
        };

        _context.ProjectTasks.Add(task);
        await _context.SaveChangesAsync(cancellationToken);

        // Reload with relations
        var createdTask = await _context.ProjectTasks
            .AsNoTracking()
            .Include(t => t.Project)
            .Include(t => t.Category)
            .FirstAsync(t => t.Id == task.Id, cancellationToken);

        return Result<TaskDto>.Success(await MapToDto(createdTask));
    }

    public async Task<Result<TaskDto>> UpdateAsync(Guid id, UpdateTaskDto dto, CancellationToken cancellationToken = default)
    {
        var task = await _context.ProjectTasks
            .Include(t => t.Project)
            .Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

        if (task == null)
        {
            return Result<TaskDto>.Failure("Task not found");
        }

        // Validate category if changing
        if (dto.CategoryId.HasValue)
        {
            var categoryExists = await _context.TaskCategories
                .AnyAsync(c => c.Id == dto.CategoryId.Value, cancellationToken);

            if (!categoryExists)
            {
                return Result<TaskDto>.Failure("Category not found");
            }
        }

        // Validate assignee if changing
        if (dto.AssigneeId != null)
        {
            if (!string.IsNullOrEmpty(dto.AssigneeId))
            {
                var user = await _userManager.FindByIdAsync(dto.AssigneeId);
                if (user == null)
                {
                    return Result<TaskDto>.Failure("Assignee not found");
                }
            }
        }

        if (dto.Title != null) task.Title = dto.Title;
        if (dto.Description != null) task.Description = dto.Description;
        if (dto.Status.HasValue)
        {
            var oldStatus = task.Status;
            task.Status = dto.Status.Value;

            // Set CompletedAt when moving to Done
            if (dto.Status.Value == ProjectTaskStatus.Done && oldStatus != ProjectTaskStatus.Done)
            {
                task.CompletedAt = DateTime.UtcNow;
            }
            else if (dto.Status.Value != ProjectTaskStatus.Done && dto.Status.Value != ProjectTaskStatus.Closed)
            {
                task.CompletedAt = null;
            }
        }
        if (dto.Priority.HasValue) task.Priority = dto.Priority.Value;
        if (dto.CategoryId.HasValue) task.CategoryId = dto.CategoryId;
        if (dto.AssigneeId != null) task.AssigneeId = string.IsNullOrEmpty(dto.AssigneeId) ? null : dto.AssigneeId;
        if (dto.EstimatedHours.HasValue) task.EstimatedHours = dto.EstimatedHours;
        if (dto.ActualHours.HasValue) task.ActualHours = dto.ActualHours;
        if (dto.DueDate.HasValue) task.DueDate = dto.DueDate;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<TaskDto>.Success(await MapToDto(task));
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var task = await _context.ProjectTasks
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

        if (task == null)
        {
            return Result.Failure("Task not found");
        }

        _context.ProjectTasks.Remove(task);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    public async Task<Result<TaskDto>> UpdateStatusAsync(Guid id, ProjectTaskStatus status, CancellationToken cancellationToken = default)
    {
        return await UpdateAsync(id, new UpdateTaskDto { Status = status }, cancellationToken);
    }

    private async Task<TaskDto> MapToDto(ProjectTask task)
    {
        string? assigneeName = null;
        string? assigneeEmail = null;

        if (!string.IsNullOrEmpty(task.AssigneeId))
        {
            var user = await _userManager.FindByIdAsync(task.AssigneeId);
            if (user != null)
            {
                assigneeName = GetFullName(user);
                assigneeEmail = user.Email;
            }
        }

        return new TaskDto
        {
            Id = task.Id,
            ProjectId = task.ProjectId,
            ProjectName = task.Project?.Name,
            ProjectCode = task.Project?.Code,
            TaskNumber = task.TaskNumber,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            Priority = task.Priority,
            CategoryId = task.CategoryId,
            CategoryName = task.Category?.Name,
            AssigneeId = task.AssigneeId,
            AssigneeName = assigneeName,
            AssigneeEmail = assigneeEmail,
            EstimatedHours = task.EstimatedHours,
            ActualHours = task.ActualHours,
            DueDate = task.DueDate,
            CompletedAt = task.CompletedAt,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt
        };
    }

    private static string? GetFullName(ApplicationUser user)
    {
        if (string.IsNullOrWhiteSpace(user.FirstName) && string.IsNullOrWhiteSpace(user.LastName))
        {
            return user.Email;
        }
        return $"{user.FirstName} {user.LastName}".Trim();
    }
}
