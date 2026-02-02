# Phase 4: Infrastructure Layer

## Obiettivo

Implementare tutti i servizi esterni e l'accesso ai dati:
- Entity Framework Core con SQL Server
- Interceptors per Audit Trail e Soft Delete
- ASP.NET Core Identity con JWT Authentication
- Implementazione di tutte le interfacce definite in Application

---

## Struttura Creata

```
src/CleanApi.Infrastructure/
├── Data/
│   ├── ApplicationDbContext.cs         # DbContext con Identity
│   └── Interceptors/
│       ├── AuditableInterceptor.cs     # Auto-fill CreatedBy/UpdatedBy
│       └── SoftDeleteInterceptor.cs    # Convert Delete → Soft Delete
├── Identity/
│   ├── ApplicationUser.cs              # User entity con refresh token
│   ├── JwtSettings.cs                  # Configurazione JWT
│   ├── JwtService.cs                   # Generazione/validazione token
│   └── IdentityService.cs              # Register, Login, Refresh
├── Services/
│   └── CurrentUserService.cs           # Implementa ICurrentUserService
└── DependencyInjection.cs              # Registrazione servizi
```

---

## NuGet Packages

| Package | Versione | Scopo |
|---------|----------|-------|
| `Microsoft.AspNetCore.Authentication.JwtBearer` | 9.0.0 | Middleware JWT |
| `Microsoft.AspNetCore.Identity.EntityFrameworkCore` | 9.0.0 | Identity + EF Core |
| `Microsoft.EntityFrameworkCore.SqlServer` | 9.0.0 | Provider SQL Server |
| `Microsoft.EntityFrameworkCore.Tools` | 9.0.0 | Migrations CLI |

---

## Dettaglio Implementazioni

### ApplicationDbContext.cs

```csharp
public class ApplicationDbContext : IdentityDbContext<ApplicationUser>, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        // Global query filter per soft delete
        foreach (var entityType in builder.Model.GetEntityTypes())
        {
            if (typeof(ISoftDelete).IsAssignableFrom(entityType.ClrType))
            {
                // Filtra automaticamente IsDeleted == false
                var parameter = Expression.Parameter(entityType.ClrType, "e");
                var property = Expression.Property(parameter, nameof(ISoftDelete.IsDeleted));
                var lambda = Expression.Lambda(
                    Expression.Equal(property, Expression.Constant(false)),
                    parameter);

                builder.Entity(entityType.ClrType).HasQueryFilter(lambda);
            }
        }
    }
}
```

#### Caratteristiche

| Feature | Descrizione |
|---------|-------------|
| Eredita da `IdentityDbContext` | Include tabelle Identity (Users, Roles, Claims, etc.) |
| Implementa `IApplicationDbContext` | Rispetta contratto definito in Application |
| Global Query Filter | Esclude automaticamente record con `IsDeleted = true` |
| Configuration Scanning | Applica automaticamente `IEntityTypeConfiguration<T>` |

#### Come Aggiungere Entità

```csharp
// 1. Aggiungi DbSet in ApplicationDbContext
public DbSet<Product> Products => Set<Product>();

// 2. Aggiungi a IApplicationDbContext (Application layer)
DbSet<Product> Products { get; }

// 3. (Opzionale) Crea configurazione
public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Name).HasMaxLength(200).IsRequired();
    }
}
```

---

### AuditableInterceptor.cs

```csharp
public class AuditableInterceptor : SaveChangesInterceptor
{
    private readonly ICurrentUserService _currentUserService;

    public AuditableInterceptor(ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(...)
    {
        UpdateEntities(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void UpdateEntities(DbContext? context)
    {
        foreach (var entry in context.ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Added)
                entry.Entity.CreatedAt = DateTime.UtcNow;
            else if (entry.State == EntityState.Modified)
                entry.Entity.UpdatedAt = DateTime.UtcNow;
        }

        foreach (var entry in context.ChangeTracker.Entries<IAuditable>())
        {
            if (entry.State == EntityState.Added)
                entry.Entity.CreatedBy = _currentUserService.UserId;
            else if (entry.State == EntityState.Modified)
                entry.Entity.UpdatedBy = _currentUserService.UserId;
        }
    }
}
```

#### Comportamento

| Operazione | Campo | Valore |
|------------|-------|--------|
| Insert | `CreatedAt` | `DateTime.UtcNow` |
| Insert | `CreatedBy` | User ID corrente |
| Update | `UpdatedAt` | `DateTime.UtcNow` |
| Update | `UpdatedBy` | User ID corrente |

---

### SoftDeleteInterceptor.cs

```csharp
public class SoftDeleteInterceptor : SaveChangesInterceptor
{
    private static void ConvertDeleteToSoftDelete(DbContext? context)
    {
        foreach (var entry in context.ChangeTracker.Entries<ISoftDelete>())
        {
            if (entry.State == EntityState.Deleted)
            {
                entry.State = EntityState.Modified;
                entry.Entity.IsDeleted = true;
                entry.Entity.DeletedAt = DateTime.UtcNow;
            }
        }
    }
}
```

#### Comportamento

Quando chiami `context.Remove(entity)`:

| Prima | Dopo |
|-------|------|
| `EntityState.Deleted` | `EntityState.Modified` |
| `IsDeleted = false` | `IsDeleted = true` |
| `DeletedAt = null` | `DeletedAt = DateTime.UtcNow` |

La riga non viene eliminata fisicamente, ma marcata come eliminata.

---

### ApplicationUser.cs

```csharp
public class ApplicationUser : IdentityUser
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }
}
```

Estende `IdentityUser` con:
- Campi profilo (`FirstName`, `LastName`)
- Campi per refresh token JWT

---

### JwtSettings.cs

```csharp
public class JwtSettings
{
    public const string SectionName = "JwtSettings";

    public string SecretKey { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int AccessTokenExpirationMinutes { get; set; } = 15;
    public int RefreshTokenExpirationDays { get; set; } = 7;
}
```

Configurazione in `appsettings.json`:

```json
{
  "JwtSettings": {
    "SecretKey": "your-secret-key-at-least-32-characters-long",
    "Issuer": "CleanApi",
    "Audience": "CleanApi",
    "AccessTokenExpirationMinutes": 15,
    "RefreshTokenExpirationDays": 7
  }
}
```

---

### JwtService.cs

| Metodo | Descrizione |
|--------|-------------|
| `GenerateAccessToken(user)` | Crea JWT con claims (sub, email, jti) |
| `GenerateRefreshToken()` | Crea token random 64 bytes Base64 |
| `GetPrincipalFromExpiredToken(token)` | Valida JWT ignorando expiration |

#### Claims nel Token

| Claim | Valore |
|-------|--------|
| `sub` (NameIdentifier) | User ID |
| `email` | User email |
| `jti` | GUID univoco token |

---

### IdentityService.cs

| Metodo | Input | Output | Descrizione |
|--------|-------|--------|-------------|
| `CreateUserAsync` | email, password | `Result<string>` (userId) | Registra nuovo utente |
| `LoginAsync` | email, password | `Result<AuthResult>` | Login e genera tokens |
| `RefreshTokenAsync` | accessToken, refreshToken | `Result<AuthResult>` | Rinnova tokens |
| `RevokeRefreshTokenAsync` | userId | `Result` | Invalida refresh token |

#### Flusso Login

```
1. Trova utente per email
2. Verifica password con Identity
3. Genera access token (JWT)
4. Genera refresh token (random)
5. Salva refresh token su utente
6. Ritorna AuthResult
```

#### Flusso Refresh Token

```
1. Estrai claims da access token (anche se scaduto)
2. Trova utente per userId dal token
3. Verifica refresh token corrisponde e non è scaduto
4. Genera nuovi access + refresh token
5. Aggiorna refresh token su utente
6. Ritorna nuovo AuthResult
```

---

### CurrentUserService.cs

```csharp
public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public string? UserId => _httpContextAccessor.HttpContext?
        .User?.FindFirstValue(ClaimTypes.NameIdentifier);

    public string? Email => _httpContextAccessor.HttpContext?
        .User?.FindFirstValue(ClaimTypes.Email);

    public bool IsAuthenticated => _httpContextAccessor.HttpContext?
        .User?.Identity?.IsAuthenticated ?? false;
}
```

Estrae informazioni utente dai claims JWT nel HttpContext.

---

### DependencyInjection.cs

Registra tutti i servizi Infrastructure:

```csharp
public static IServiceCollection AddInfrastructureServices(
    this IServiceCollection services,
    IConfiguration configuration)
{
    // 1. Database + Interceptors
    services.AddDbContext<ApplicationDbContext>((sp, options) =>
    {
        options.AddInterceptors(
            sp.GetRequiredService<AuditableInterceptor>(),
            sp.GetRequiredService<SoftDeleteInterceptor>());
        options.UseSqlServer(connectionString);
    });

    // 2. Identity
    services.AddIdentity<ApplicationUser, IdentityRole>(options => { ... })
        .AddEntityFrameworkStores<ApplicationDbContext>();

    // 3. JWT Authentication
    services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options => { ... });

    // 4. Services
    services.AddScoped<ICurrentUserService, CurrentUserService>();
    services.AddScoped<IIdentityService, IdentityService>();

    return services;
}
```

---

## Verifica

```bash
# Build del progetto Infrastructure
dotnet build src/CleanApi.Infrastructure

# Output atteso: Build succeeded, 0 Errors
```

---

## Prossimi Passi

Nel **Phase 5 (WebApi Layer)** implementeremo:

- `Program.cs` - Configurazione DI e middleware pipeline
- `ExceptionHandlingMiddleware` - Gestione errori con ProblemDetails
- `AuthController` - Endpoints per register, login, refresh
- `Swagger/OpenAPI` - Documentazione API con JWT auth
- `appsettings.json` - Configurazione JWT e connection string
