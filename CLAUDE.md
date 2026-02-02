# CleanApi - Claude Code Instructions

## Project Overview

CleanApi is a .NET 9 Clean Architecture API boilerplate with:
- ASP.NET Core Identity + JWT authentication
- Entity Framework Core with SQL Server
- Soft Delete and Audit Trail patterns
- Hangfire for background jobs
- Docker support

## Project Structure

```
src/
├── CleanApi.Domain/         # Entities, interfaces (no dependencies)
├── CleanApi.Application/    # Use cases, DTOs, validators
├── CleanApi.Infrastructure/ # EF Core, Identity, external services
└── CleanApi.WebApi/         # Controllers, middleware, configuration

tests/
└── CleanApi.UnitTests/      # xUnit tests

tools/
└── TrelloSync/              # Task sync tool (YAML → Trello)

docs/                        # Phase documentation
tasks/                       # plan.yaml for task management
```

## Key Patterns

### Dependency Direction
Domain ← Application ← Infrastructure ← WebApi

### Base Entity
All entities inherit from `BaseEntity` (Id, CreatedAt, UpdatedAt).
Implement `ISoftDelete` for soft delete, `IAuditable` for audit trail.

### Result Pattern
Use `Result<T>` for operations that can fail without throwing exceptions.

### Exception Handling
- `ValidationException` → 400
- `NotFoundException` → 404
- `ForbiddenException` → 403
- `DomainException` → 422

## Common Commands

```bash
# Build
dotnet build

# Run
dotnet run --project src/CleanApi.WebApi

# Test
dotnet test

# Docker
docker-compose up --build

# EF Core migrations
dotnet ef migrations add <Name> --project src/CleanApi.Infrastructure --startup-project src/CleanApi.WebApi
dotnet ef database update --project src/CleanApi.Infrastructure --startup-project src/CleanApi.WebApi
```

## Adding New Features

1. **Entity**: Create in `Domain/Entities`, inherit from `BaseEntity`
2. **DbSet**: Add to `IApplicationDbContext` and `ApplicationDbContext`
3. **Service**: Create interface in `Application/Common/Interfaces`, implement in `Infrastructure/Services`
4. **Controller**: Create in `WebApi/Controllers`, inject services via constructor
5. **Validation**: Create validator in `Application/Features/<Feature>/`

## Configuration

- `appsettings.json`: Connection string, JWT settings, Serilog
- `JwtSettings.SecretKey`: Must be at least 32 characters
- Environment variables override appsettings in Docker

## Testing

- Use xUnit, FluentAssertions, NSubstitute
- Naming: `MethodName_Scenario_ExpectedResult`
- Mock `IApplicationDbContext` and external services

## Task Management

Update `tasks/plan.yaml` and run:
```bash
dotnet run --project tools/TrelloSync -- push
```
