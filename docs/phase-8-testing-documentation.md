# Phase 8: Testing & Documentation

## Obiettivo

Completare il boilerplate con:
- Test unitari con xUnit
- CLAUDE.md per Claude Code
- README.md per sviluppatori

---

## Struttura Test

```
tests/
└── CleanApi.UnitTests/
    └── Common/
        └── Models/
            ├── ResultTests.cs      # Test per Result pattern
            └── AuthResultTests.cs  # Test per AuthResult
```

---

## NuGet Packages (Test)

| Package | Versione | Scopo |
|---------|----------|-------|
| `xunit` | 2.9.2 | Test framework |
| `FluentAssertions` | 7.0.0 | Asserzioni fluent |
| `NSubstitute` | 5.3.0 | Mocking framework |
| `coverlet.collector` | 6.0.2 | Code coverage |

---

## Convenzioni di Naming

```
MethodName_Scenario_ExpectedResult
```

Esempi:
- `Success_ShouldReturnSucceededTrue`
- `Failure_WithSingleError_ShouldReturnSucceededFalse`
- `AccessingValue_WhenFailed_ShouldThrowException`

---

## Esempio Test

### ResultTests.cs

```csharp
public class ResultTests
{
    [Fact]
    public void Success_ShouldReturnSucceededTrue()
    {
        // Act
        var result = Result.Success();

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public void Failure_WithSingleError_ShouldReturnSucceededFalse()
    {
        // Arrange
        var errorMessage = "Something went wrong";

        // Act
        var result = Result.Failure(errorMessage);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Errors.Should().ContainSingle()
            .Which.Should().Be(errorMessage);
    }
}
```

### FluentAssertions

| Metodo | Descrizione |
|--------|-------------|
| `Should().BeTrue()` | Verifica valore true |
| `Should().BeEmpty()` | Verifica collezione vuota |
| `Should().ContainSingle()` | Verifica un solo elemento |
| `Should().Throw<T>()` | Verifica eccezione |
| `Should().BeEquivalentTo()` | Confronto deep |

### NSubstitute (Mocking)

```csharp
[Fact]
public async Task CreateUser_WithValidData_ShouldReturnSuccess()
{
    // Arrange
    var dbContext = Substitute.For<IApplicationDbContext>();
    dbContext.SaveChangesAsync(Arg.Any<CancellationToken>())
        .Returns(1);

    var service = new UserService(dbContext);

    // Act
    var result = await service.CreateUserAsync("test@test.com");

    // Assert
    result.Succeeded.Should().BeTrue();
    await dbContext.Received(1)
        .SaveChangesAsync(Arg.Any<CancellationToken>());
}
```

---

## Comandi Test

```bash
# Esegui tutti i test
dotnet test

# Con output dettagliato
dotnet test --verbosity normal

# Solo test specifici
dotnet test --filter "FullyQualifiedName~ResultTests"

# Con code coverage
dotnet test --collect:"XPlat Code Coverage"
```

---

## CLAUDE.md

File per istruire Claude Code su:
- Struttura progetto
- Pattern usati
- Comandi comuni
- Come aggiungere feature

---

## README.md

Documentazione utente con:
- Features
- Quick Start (local e Docker)
- API Endpoints
- Configurazione
- Comandi sviluppo

---

## Verifica

```bash
# Run tests
dotnet test

# Build completo
dotnet build

# Verifica README rendering
# (visualizza in GitHub o VS Code preview)
```

---

## Riepilogo Boilerplate Completato

| Phase | Stato | Descrizione |
|-------|-------|-------------|
| 1 | Done | Solution structure |
| 2 | Done | Domain layer |
| 3 | Done | Application layer |
| 4 | Done | Infrastructure layer |
| 5 | Done | WebApi layer |
| 6 | Done | Hangfire |
| 7 | Done | Docker |
| 8 | Done | Testing & Documentation |

### File Principali Creati

```
src/CleanApi.Domain/
├── Common/
│   ├── BaseEntity.cs
│   ├── ISoftDelete.cs
│   └── IAuditable.cs
└── Exceptions/
    ├── DomainException.cs
    ├── NotFoundException.cs
    ├── ValidationException.cs
    └── ForbiddenException.cs

src/CleanApi.Application/
├── Common/
│   ├── Interfaces/
│   │   ├── IApplicationDbContext.cs
│   │   ├── ICurrentUserService.cs
│   │   ├── IIdentityService.cs
│   │   └── IBackgroundJobService.cs
│   └── Models/
│       └── Result.cs
└── DependencyInjection.cs

src/CleanApi.Infrastructure/
├── Data/
│   ├── ApplicationDbContext.cs
│   └── Interceptors/
│       ├── AuditableInterceptor.cs
│       └── SoftDeleteInterceptor.cs
├── Identity/
│   ├── ApplicationUser.cs
│   ├── JwtSettings.cs
│   ├── JwtService.cs
│   └── IdentityService.cs
├── BackgroundJobs/
│   ├── BackgroundJobService.cs
│   └── CleanupExpiredTokensJob.cs
├── Services/
│   └── CurrentUserService.cs
└── DependencyInjection.cs

src/CleanApi.WebApi/
├── Controllers/
│   └── AuthController.cs
├── Middleware/
│   └── ExceptionHandlingMiddleware.cs
├── Program.cs
├── appsettings.json
└── appsettings.Development.json

tests/CleanApi.UnitTests/
└── Common/Models/
    ├── ResultTests.cs
    └── AuthResultTests.cs

Dockerfile
docker-compose.yml
.dockerignore
CLAUDE.md
README.md
docs/
├── phase-1-solution-structure.md
├── phase-2-domain-layer.md
├── phase-3-application-layer.md
├── phase-4-infrastructure-layer.md
├── phase-5-webapi-layer.md
├── phase-6-hangfire.md
├── phase-7-docker.md
└── phase-8-testing-documentation.md
```
