using CleanApi.Application.Common.Interfaces;
using CleanApi.Application.Common.Models;
using CleanApi.Application.Features.Projects;
using CleanApi.Domain.Entities;
using CleanApi.Domain.Enums;
using CleanApi.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace CleanApi.Infrastructure.Services;

/// <summary>
/// Implementation of IProjectService.
/// </summary>
public class ProjectService : IProjectService
{
    private readonly IApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ICurrentUserService _currentUserService;

    public ProjectService(
        IApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _userManager = userManager;
        _currentUserService = currentUserService;
    }

    public async Task<Result<IEnumerable<ProjectListDto>>> GetAllAsync(string? searchTerm = null, bool? isActive = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Projects
            .AsNoTracking()
            .Include(p => p.Members)
            .Include(p => p.Tasks)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var search = searchTerm.ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(search) ||
                p.Code.ToLower().Contains(search) ||
                (p.Description != null && p.Description.ToLower().Contains(search)));
        }

        if (isActive.HasValue)
        {
            query = query.Where(p => p.IsActive == isActive.Value);
        }

        var projects = await query
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);

        var dtos = projects.Select(p => new ProjectListDto
        {
            Id = p.Id,
            Name = p.Name,
            Code = p.Code,
            Description = p.Description,
            IsActive = p.IsActive,
            MemberCount = p.Members.Count,
            TaskCount = p.Tasks.Count,
            CompletedTaskCount = p.Tasks.Count(t => t.Status == ProjectTaskStatus.Done || t.Status == ProjectTaskStatus.Closed)
        });

        return Result<IEnumerable<ProjectListDto>>.Success(dtos);
    }

    public async Task<Result<ProjectDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var project = await _context.Projects
            .AsNoTracking()
            .Include(p => p.Members)
            .Include(p => p.Tasks)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (project == null)
        {
            return Result<ProjectDto>.Failure("Project not found");
        }

        return Result<ProjectDto>.Success(MapToDto(project));
    }

    public async Task<Result<ProjectDto>> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        var project = await _context.Projects
            .AsNoTracking()
            .Include(p => p.Members)
            .Include(p => p.Tasks)
            .FirstOrDefaultAsync(p => p.Code == code, cancellationToken);

        if (project == null)
        {
            return Result<ProjectDto>.Failure("Project not found");
        }

        return Result<ProjectDto>.Success(MapToDto(project));
    }

    public async Task<Result<ProjectDto>> CreateAsync(CreateProjectDto dto, CancellationToken cancellationToken = default)
    {
        // Check for duplicate code
        var codeExists = await _context.Projects
            .AnyAsync(p => p.Code == dto.Code, cancellationToken);

        if (codeExists)
        {
            return Result<ProjectDto>.Failure("A project with this code already exists");
        }

        var project = new Project
        {
            Name = dto.Name,
            Code = dto.Code.ToUpperInvariant(),
            Description = dto.Description,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            IsActive = true
        };

        _context.Projects.Add(project);

        // Add current user as owner
        var currentUserId = _currentUserService.UserId;
        if (!string.IsNullOrEmpty(currentUserId))
        {
            var member = new ProjectMember
            {
                ProjectId = project.Id,
                UserId = currentUserId,
                Role = ProjectRole.Owner,
                JoinedAt = DateTime.UtcNow
            };
            _context.ProjectMembers.Add(member);
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Reload to get members
        var createdProject = await _context.Projects
            .AsNoTracking()
            .Include(p => p.Members)
            .Include(p => p.Tasks)
            .FirstAsync(p => p.Id == project.Id, cancellationToken);

        return Result<ProjectDto>.Success(MapToDto(createdProject));
    }

    public async Task<Result<ProjectDto>> UpdateAsync(Guid id, UpdateProjectDto dto, CancellationToken cancellationToken = default)
    {
        var project = await _context.Projects
            .Include(p => p.Members)
            .Include(p => p.Tasks)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (project == null)
        {
            return Result<ProjectDto>.Failure("Project not found");
        }

        if (dto.Name != null) project.Name = dto.Name;
        if (dto.Description != null) project.Description = dto.Description;
        if (dto.StartDate.HasValue) project.StartDate = dto.StartDate;
        if (dto.EndDate.HasValue) project.EndDate = dto.EndDate;
        if (dto.IsActive.HasValue) project.IsActive = dto.IsActive.Value;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<ProjectDto>.Success(MapToDto(project));
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var project = await _context.Projects
            .Include(p => p.Tasks)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (project == null)
        {
            return Result.Failure("Project not found");
        }

        if (project.Tasks.Any())
        {
            return Result.Failure("Cannot delete a project with tasks. Delete or move tasks first.");
        }

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    public async Task<Result<IEnumerable<ProjectMemberDto>>> GetMembersAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        var projectExists = await _context.Projects
            .AnyAsync(p => p.Id == projectId, cancellationToken);

        if (!projectExists)
        {
            return Result<IEnumerable<ProjectMemberDto>>.Failure("Project not found");
        }

        var members = await _context.ProjectMembers
            .AsNoTracking()
            .Where(m => m.ProjectId == projectId)
            .ToListAsync(cancellationToken);

        var dtos = new List<ProjectMemberDto>();
        foreach (var member in members)
        {
            var user = await _userManager.FindByIdAsync(member.UserId);
            if (user != null)
            {
                dtos.Add(new ProjectMemberDto
                {
                    Id = member.Id,
                    UserId = member.UserId,
                    UserEmail = user.Email!,
                    UserFullName = GetFullName(user),
                    Role = member.Role,
                    JoinedAt = member.JoinedAt
                });
            }
        }

        return Result<IEnumerable<ProjectMemberDto>>.Success(dtos.OrderBy(m => m.Role).ThenBy(m => m.UserFullName));
    }

    public async Task<Result<ProjectMemberDto>> AddMemberAsync(Guid projectId, AddProjectMemberDto dto, CancellationToken cancellationToken = default)
    {
        var project = await _context.Projects
            .FirstOrDefaultAsync(p => p.Id == projectId, cancellationToken);

        if (project == null)
        {
            return Result<ProjectMemberDto>.Failure("Project not found");
        }

        var user = await _userManager.FindByIdAsync(dto.UserId);
        if (user == null)
        {
            return Result<ProjectMemberDto>.Failure("User not found");
        }

        var existingMember = await _context.ProjectMembers
            .FirstOrDefaultAsync(m => m.ProjectId == projectId && m.UserId == dto.UserId, cancellationToken);

        if (existingMember != null)
        {
            return Result<ProjectMemberDto>.Failure("User is already a member of this project");
        }

        var member = new ProjectMember
        {
            ProjectId = projectId,
            UserId = dto.UserId,
            Role = dto.Role,
            JoinedAt = DateTime.UtcNow
        };

        _context.ProjectMembers.Add(member);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<ProjectMemberDto>.Success(new ProjectMemberDto
        {
            Id = member.Id,
            UserId = member.UserId,
            UserEmail = user.Email!,
            UserFullName = GetFullName(user),
            Role = member.Role,
            JoinedAt = member.JoinedAt
        });
    }

    public async Task<Result<ProjectMemberDto>> UpdateMemberAsync(Guid projectId, Guid memberId, UpdateProjectMemberDto dto, CancellationToken cancellationToken = default)
    {
        var member = await _context.ProjectMembers
            .FirstOrDefaultAsync(m => m.Id == memberId && m.ProjectId == projectId, cancellationToken);

        if (member == null)
        {
            return Result<ProjectMemberDto>.Failure("Member not found");
        }

        member.Role = dto.Role;
        await _context.SaveChangesAsync(cancellationToken);

        var user = await _userManager.FindByIdAsync(member.UserId);

        return Result<ProjectMemberDto>.Success(new ProjectMemberDto
        {
            Id = member.Id,
            UserId = member.UserId,
            UserEmail = user?.Email ?? "",
            UserFullName = user != null ? GetFullName(user) : null,
            Role = member.Role,
            JoinedAt = member.JoinedAt
        });
    }

    public async Task<Result> RemoveMemberAsync(Guid projectId, Guid memberId, CancellationToken cancellationToken = default)
    {
        var member = await _context.ProjectMembers
            .FirstOrDefaultAsync(m => m.Id == memberId && m.ProjectId == projectId, cancellationToken);

        if (member == null)
        {
            return Result.Failure("Member not found");
        }

        // Prevent removing the last owner
        if (member.Role == ProjectRole.Owner)
        {
            var ownerCount = await _context.ProjectMembers
                .CountAsync(m => m.ProjectId == projectId && m.Role == ProjectRole.Owner, cancellationToken);

            if (ownerCount <= 1)
            {
                return Result.Failure("Cannot remove the last owner. Transfer ownership first.");
            }
        }

        _context.ProjectMembers.Remove(member);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    private static ProjectDto MapToDto(Project project)
    {
        return new ProjectDto
        {
            Id = project.Id,
            Name = project.Name,
            Code = project.Code,
            Description = project.Description,
            StartDate = project.StartDate,
            EndDate = project.EndDate,
            IsActive = project.IsActive,
            CreatedAt = project.CreatedAt,
            UpdatedAt = project.UpdatedAt,
            MemberCount = project.Members.Count,
            TaskCount = project.Tasks.Count
        };
    }

    private static string? GetFullName(ApplicationUser user)
    {
        if (string.IsNullOrWhiteSpace(user.FirstName) && string.IsNullOrWhiteSpace(user.LastName))
        {
            return null;
        }
        return $"{user.FirstName} {user.LastName}".Trim();
    }
}
