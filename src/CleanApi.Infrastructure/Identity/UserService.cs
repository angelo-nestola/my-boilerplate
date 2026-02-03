using CleanApi.Application.Common.Models;
using CleanApi.Application.Features.Users;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace CleanApi.Infrastructure.Identity;

/// <summary>
/// Implementation of IUserService using ASP.NET Core Identity.
/// </summary>
public class UserService : IUserService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public UserService(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task<Result<IEnumerable<UserDto>>> GetAllAsync(string? searchTerm = null, CancellationToken cancellationToken = default)
    {
        var query = _userManager.Users.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var search = searchTerm.ToLower();
            query = query.Where(u =>
                (u.Email != null && u.Email.ToLower().Contains(search)) ||
                (u.FirstName != null && u.FirstName.ToLower().Contains(search)) ||
                (u.LastName != null && u.LastName.ToLower().Contains(search)));
        }

        var users = await query.ToListAsync(cancellationToken);
        var dtos = new List<UserDto>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            dtos.Add(MapToDto(user, roles));
        }

        return Result<IEnumerable<UserDto>>.Success(dtos);
    }

    public async Task<Result<UserDto>> GetByIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return Result<UserDto>.Failure("User not found");
        }

        var roles = await _userManager.GetRolesAsync(user);
        return Result<UserDto>.Success(MapToDto(user, roles));
    }

    public async Task<Result<UserDto>> CreateAsync(CreateUserDto dto, CancellationToken cancellationToken = default)
    {
        var existingUser = await _userManager.FindByEmailAsync(dto.Email);
        if (existingUser != null)
        {
            return Result<UserDto>.Failure("A user with this email already exists");
        }

        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            PhoneNumber = dto.PhoneNumber,
            EmailConfirmed = true // Auto-confirm for admin-created users
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            return Result<UserDto>.Failure(string.Join(", ", result.Errors.Select(e => e.Description)));
        }

        // Add roles
        if (dto.Roles.Any())
        {
            var roleResult = await _userManager.AddToRolesAsync(user, dto.Roles);
            if (!roleResult.Succeeded)
            {
                return Result<UserDto>.Failure(string.Join(", ", roleResult.Errors.Select(e => e.Description)));
            }
        }

        var roles = await _userManager.GetRolesAsync(user);
        return Result<UserDto>.Success(MapToDto(user, roles));
    }

    public async Task<Result<UserDto>> UpdateAsync(string userId, UpdateUserDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return Result<UserDto>.Failure("User not found");
        }

        if (dto.FirstName != null) user.FirstName = dto.FirstName;
        if (dto.LastName != null) user.LastName = dto.LastName;
        if (dto.PhoneNumber != null) user.PhoneNumber = dto.PhoneNumber;
        if (dto.IsActive.HasValue) user.LockoutEnd = dto.IsActive.Value ? null : DateTimeOffset.MaxValue;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return Result<UserDto>.Failure(string.Join(", ", result.Errors.Select(e => e.Description)));
        }

        // Update roles if provided
        if (dto.Roles != null)
        {
            var currentRoles = await _userManager.GetRolesAsync(user);
            var rolesToRemove = currentRoles.Except(dto.Roles);
            var rolesToAdd = dto.Roles.Except(currentRoles);

            if (rolesToRemove.Any())
            {
                await _userManager.RemoveFromRolesAsync(user, rolesToRemove);
            }

            if (rolesToAdd.Any())
            {
                await _userManager.AddToRolesAsync(user, rolesToAdd);
            }
        }

        var roles = await _userManager.GetRolesAsync(user);
        return Result<UserDto>.Success(MapToDto(user, roles));
    }

    public async Task<Result> ChangePasswordAsync(string userId, ChangePasswordDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return Result.Failure("User not found");
        }

        // Remove current password and set new one
        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, token, dto.NewPassword);

        if (!result.Succeeded)
        {
            return Result.Failure(string.Join(", ", result.Errors.Select(e => e.Description)));
        }

        return Result.Success();
    }

    public async Task<Result> DeleteAsync(string userId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return Result.Failure("User not found");
        }

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            return Result.Failure(string.Join(", ", result.Errors.Select(e => e.Description)));
        }

        return Result.Success();
    }

    public async Task<Result<IEnumerable<string>>> GetRolesAsync(CancellationToken cancellationToken = default)
    {
        var roles = await _roleManager.Roles
            .Select(r => r.Name!)
            .ToListAsync(cancellationToken);

        return Result<IEnumerable<string>>.Success(roles);
    }

    private static UserDto MapToDto(ApplicationUser user, IEnumerable<string> roles)
    {
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            PhoneNumber = user.PhoneNumber,
            EmailConfirmed = user.EmailConfirmed,
            IsActive = user.LockoutEnd == null || user.LockoutEnd < DateTimeOffset.UtcNow,
            Roles = roles
        };
    }
}
