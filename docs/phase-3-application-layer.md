# Phase 3: Application Layer

## Obiettivo

Implementare il cuore dell'Application layer con:
- Interfacce per i servizi implementati in Infrastructure
- Result pattern per gestione errori senza eccezioni
- Configurazione Dependency Injection per FluentValidation e Mapster

---

## Ruolo dell'Application Layer

L'Application layer è il **coordinatore** dell'applicazione:

1. **Definisce le interfacce** - Che vengono implementate da Infrastructure
2. **Orchestrare use cases** - Coordina Domain e servizi esterni
3. **Non conosce dettagli tecnici** - Non sa se usa SQL Server o MongoDB
4. **Dipende solo da Domain** - Segue la regola delle dipendenze verso l'interno

---

## Struttura Creata

```
src/CleanApi.Application/
├── Common/
│   ├── Interfaces/
│   │   ├── IApplicationDbContext.cs   # Interface per DbContext
│   │   └── ICurrentUserService.cs     # Interface per utente corrente
│   └── Models/
│       └── Result.cs                  # Result pattern
└── DependencyInjection.cs             # Registrazione servizi
```

---

## NuGet Packages Aggiunti

| Package | Versione | Scopo |
|---------|----------|-------|
| `FluentValidation.DependencyInjectionExtensions` | 11.11.0 | Validazione input con sintassi fluent |
| `Mapster` | 7.4.0 | Object mapping (alternativa leggera a AutoMapper) |
| `Mapster.DependencyInjection` | 1.0.1 | Integrazione con DI container |
| `Microsoft.EntityFrameworkCore` | 9.0.0 | Solo per tipo DbSet<T> nell'interfaccia |

---

## Dettaglio Implementazioni

### IApplicationDbContext.cs

```csharp
using Microsoft.EntityFrameworkCore;

namespace CleanApi.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
```

#### Scopo

Definisce il contratto per il DbContext. L'Application layer:
- **Non conosce** EF Core implementation details
- **Non conosce** la connection string
- **Conosce solo** che può salvare le modifiche

#### Come Verrà Estesa (Phase 4)

Quando aggiungerai entità, l'interfaccia crescerà:

```csharp
public interface IApplicationDbContext
{
    DbSet<Product> Products { get; }
    DbSet<Order> Orders { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
```

#### Esempio di Utilizzo (nei servizi)

```csharp
public class ProductService
{
    private readonly IApplicationDbContext _context;

    public ProductService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Product> CreateAsync(string name, decimal price)
    {
        var product = new Product { Name = name, Price = price };
        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        return product;
    }
}
```

---

### ICurrentUserService.cs

```csharp
namespace CleanApi.Application.Common.Interfaces;

public interface ICurrentUserService
{
    string? UserId { get; }
    string? Email { get; }
    bool IsAuthenticated { get; }
}
```

#### Scopo

Fornisce accesso all'utente autenticato senza dipendere da HttpContext o JWT.

| Proprietà | Tipo | Descrizione |
|-----------|------|-------------|
| `UserId` | `string?` | ID univoco dell'utente (dal claim `sub` del JWT) |
| `Email` | `string?` | Email dell'utente (dal claim `email`) |
| `IsAuthenticated` | `bool` | True se l'utente ha un token valido |

#### Implementazione (sarà in Infrastructure)

```csharp
public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? UserId => _httpContextAccessor.HttpContext?
        .User?.FindFirstValue(ClaimTypes.NameIdentifier);

    public string? Email => _httpContextAccessor.HttpContext?
        .User?.FindFirstValue(ClaimTypes.Email);

    public bool IsAuthenticated => _httpContextAccessor.HttpContext?
        .User?.Identity?.IsAuthenticated ?? false;
}
```

#### Utilizzo con Audit Trail

```csharp
// Nell'AuditableInterceptor (Infrastructure)
public override ValueTask<InterceptionResult<int>> SavingChangesAsync(...)
{
    foreach (var entry in context.ChangeTracker.Entries<IAuditable>())
    {
        if (entry.State == EntityState.Added)
        {
            entry.Entity.CreatedBy = _currentUserService.UserId;
        }
        else if (entry.State == EntityState.Modified)
        {
            entry.Entity.UpdatedBy = _currentUserService.UserId;
        }
    }
    // ...
}
```

---

### Result.cs (Result Pattern)

```csharp
namespace CleanApi.Application.Common.Models;

public class Result
{
    protected Result(bool succeeded, IEnumerable<string> errors)
    {
        Succeeded = succeeded;
        Errors = errors.ToArray();
    }

    public bool Succeeded { get; }
    public string[] Errors { get; }

    public static Result Success() => new(true, Array.Empty<string>());
    public static Result Failure(IEnumerable<string> errors) => new(false, errors);
    public static Result Failure(string error) => new(false, new[] { error });
}

public class Result<T> : Result
{
    private readonly T? _value;

    protected Result(T? value, bool succeeded, IEnumerable<string> errors)
        : base(succeeded, errors)
    {
        _value = value;
    }

    public T Value => Succeeded
        ? _value!
        : throw new InvalidOperationException("Cannot access Value when operation failed.");

    public T? ValueOrDefault => _value;

    public static Result<T> Success(T value) => new(value, true, Array.Empty<string>());
    public new static Result<T> Failure(IEnumerable<string> errors) => new(default, false, errors);
    public new static Result<T> Failure(string error) => new(default, false, new[] { error });

    public static implicit operator Result<T>(T value) => Success(value);
}
```

#### Perché il Result Pattern?

| Approccio | Pro | Contro |
|-----------|-----|--------|
| Eccezioni | Familiare, stack trace | Costose, flow control poco chiaro |
| Result Pattern | Esplicito, type-safe, composable | Più verboso |

Il Result pattern rende **esplicito** che un'operazione può fallire.

#### Quando Usare Eccezioni vs Result

| Scenario | Usa |
|----------|-----|
| Risorsa non trovata (404) | `NotFoundException` |
| Validazione input utente (400) | `ValidationException` |
| Regola di business violata (422) | `DomainException` |
| Operazione che può fallire "normalmente" | `Result<T>` |
| Errore di programmazione | Exception standard |

#### Esempi di Utilizzo

**Caso semplice:**
```csharp
public async Task<Result<Product>> GetByIdAsync(Guid id)
{
    var product = await _context.Products.FindAsync(id);

    if (product == null)
        return Result<Product>.Failure("Product not found");

    return product; // implicit conversion to Success
}
```

**Composizione:**
```csharp
public async Task<Result> ProcessOrderAsync(Guid productId, int quantity)
{
    var productResult = await GetByIdAsync(productId);

    if (!productResult.Succeeded)
        return Result.Failure(productResult.Errors);

    var product = productResult.Value;

    if (product.StockQuantity < quantity)
        return Result.Failure("Insufficient stock");

    product.StockQuantity -= quantity;
    await _context.SaveChangesAsync();

    return Result.Success();
}
```

**Nel Controller:**
```csharp
[HttpPost]
public async Task<IActionResult> ProcessOrder([FromBody] OrderRequest request)
{
    var result = await _orderService.ProcessOrderAsync(request.ProductId, request.Quantity);

    if (!result.Succeeded)
        return BadRequest(new { errors = result.Errors });

    return Ok();
}
```

---

### DependencyInjection.cs

```csharp
using System.Reflection;
using FluentValidation;
using Mapster;
using MapsterMapper;
using Microsoft.Extensions.DependencyInjection;

namespace CleanApi.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // FluentValidation - auto-register all validators
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        // Mapster - register mapping configuration
        var config = TypeAdapterConfig.GlobalSettings;
        config.Scan(Assembly.GetExecutingAssembly());
        services.AddSingleton(config);
        services.AddScoped<IMapper, ServiceMapper>();

        return services;
    }
}
```

#### Cosa Registra

| Servizio | Lifetime | Descrizione |
|----------|----------|-------------|
| Validators | Scoped | Tutti i validator che implementano `IValidator<T>` |
| `TypeAdapterConfig` | Singleton | Configurazione Mapster (scansiona assembly per mappings) |
| `IMapper` | Scoped | Servizio per eseguire mappings |

#### Utilizzo in Program.cs (WebApi)

```csharp
// Program.cs
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);
```

---

## FluentValidation - Come Usarlo

Quando aggiungerai feature, creerai validator così:

```csharp
// Application/Features/Products/CreateProductValidator.cs
public class CreateProductValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(200).WithMessage("Name cannot exceed 200 characters");

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Price must be greater than zero");
    }
}
```

I validator vengono **auto-registrati** da `AddValidatorsFromAssembly`.

---

## Mapster - Come Usarlo

Quando aggiungerai feature, configurerai mappings così:

```csharp
// Application/Features/Products/ProductMappingConfig.cs
public class ProductMappingConfig : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<Product, ProductDto>()
            .Map(dest => dest.FullName, src => $"{src.Name} - {src.Category}");
    }
}
```

La configurazione viene **auto-scansionata** da `config.Scan(Assembly)`.

**Utilizzo nel codice:**
```csharp
public class ProductService
{
    private readonly IMapper _mapper;

    public ProductService(IMapper mapper)
    {
        _mapper = mapper;
    }

    public ProductDto GetDto(Product product)
    {
        return _mapper.Map<ProductDto>(product);
    }
}
```

---

## Verifica

```bash
# Build del progetto Application
dotnet build src/CleanApi.Application

# Output atteso: Build succeeded, 0 Errors
```

---

## Prossimi Passi

Nel **Phase 4 (Infrastructure Layer)** implementeremo:

- `ApplicationDbContext` - Implementazione del DbContext con EF Core
- `AuditableInterceptor` - Popola automaticamente CreatedBy/UpdatedBy
- `SoftDeleteInterceptor` - Converte Delete in Update IsDeleted
- `CurrentUserService` - Implementazione di ICurrentUserService
- Configurazione Identity e JWT
