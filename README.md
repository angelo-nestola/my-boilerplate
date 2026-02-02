# CleanApi

.NET 9 Clean Architecture API Boilerplate

## Features

- **Clean Architecture** - Domain, Application, Infrastructure, WebApi layers
- **Authentication** - ASP.NET Core Identity + JWT with refresh tokens
- **Database** - Entity Framework Core with SQL Server
- **Soft Delete** - Automatic soft delete via EF Core interceptors
- **Audit Trail** - Automatic CreatedBy/UpdatedBy tracking
- **Background Jobs** - Hangfire with SQL Server storage
- **Validation** - FluentValidation with auto-registration
- **Mapping** - Mapster for object mapping
- **Logging** - Serilog (console sink)
- **API Docs** - Swagger/OpenAPI with JWT support
- **Docker** - Multi-stage Dockerfile + docker-compose

## Quick Start

### Prerequisites

- .NET 9 SDK
- SQL Server (or Docker)

### Local Development

```bash
# Clone
git clone <repo-url>
cd CleanApi

# Restore & Build
dotnet restore
dotnet build

# Run (requires SQL Server)
dotnet run --project src/CleanApi.WebApi
```

### Docker

```bash
# Build and run with SQL Server
docker-compose up --build

# Access
# API: http://localhost:8080
# Swagger: http://localhost:8080/swagger
# Hangfire: http://localhost:8080/hangfire
```

## Project Structure

```
├── src/
│   ├── CleanApi.Domain/         # Entities, interfaces
│   ├── CleanApi.Application/    # Business logic, DTOs
│   ├── CleanApi.Infrastructure/ # Data access, external services
│   └── CleanApi.WebApi/         # API endpoints
├── tests/
│   └── CleanApi.UnitTests/      # Unit tests
├── docs/                        # Documentation
├── Dockerfile
└── docker-compose.yml
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Revoke refresh token |
| GET | `/api/auth/me` | Get current user info |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

## Configuration

### appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=CleanApiDb;..."
  },
  "JwtSettings": {
    "SecretKey": "your-secret-key-at-least-32-characters",
    "Issuer": "CleanApi",
    "Audience": "CleanApi",
    "AccessTokenExpirationMinutes": 15,
    "RefreshTokenExpirationDays": 7
  }
}
```

### Environment Variables (Docker)

```
ConnectionStrings__DefaultConnection=Server=sqlserver;...
JwtSettings__SecretKey=your-production-secret
```

## Development

### Add Migration

```bash
dotnet ef migrations add <Name> \
  --project src/CleanApi.Infrastructure \
  --startup-project src/CleanApi.WebApi
```

### Update Database

```bash
dotnet ef database update \
  --project src/CleanApi.Infrastructure \
  --startup-project src/CleanApi.WebApi
```

### Run Tests

```bash
dotnet test
```

## Architecture

```
┌─────────────┐
│   WebApi    │  Controllers, Middleware
├─────────────┤
│Infrastructure│  EF Core, Identity, Services
├─────────────┤
│ Application │  Use Cases, DTOs, Validators
├─────────────┤
│   Domain    │  Entities, Interfaces
└─────────────┘
```

Dependencies flow inward. Domain has no dependencies.

## License

MIT
