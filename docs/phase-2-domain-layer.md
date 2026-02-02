# Phase 2: Domain Layer

## Obiettivo

Implementare il cuore del Domain layer con:
- Classe base per tutte le entità
- Interfacce per funzionalità cross-cutting (Soft Delete, Audit Trail)
- Eccezioni di dominio per gestione errori strutturata

---

## Perché il Domain Layer è Importante

Il Domain layer è il **centro** della Clean Architecture:

1. **Nessuna dipendenza esterna** - Non referenzia altri progetti o NuGet packages
2. **Logica di business pura** - Contiene le regole che non cambiano se cambi database o framework
3. **Testabile in isolamento** - Può essere testato senza mock complessi
4. **Linguaggio Ubiquo** - I nomi delle classi riflettono il linguaggio del business

---

## Struttura Creata

```
src/CleanApi.Domain/
├── Common/
│   ├── BaseEntity.cs       # Classe base per tutte le entità
│   ├── ISoftDelete.cs      # Interface per soft delete
│   └── IAuditable.cs       # Interface per audit trail
└── Exceptions/
    ├── DomainException.cs      # Errori di business generici
    ├── NotFoundException.cs    # Risorsa non trovata
    ├── ValidationException.cs  # Errori di validazione
    └── ForbiddenException.cs   # Accesso negato
```

---

## Dettaglio Implementazioni

### BaseEntity.cs

```csharp
namespace CleanApi.Domain.Common;

public abstract class BaseEntity
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
```

#### Scelte di Design

| Proprietà | Tipo | Motivazione |
|-----------|------|-------------|
| `Id` | `Guid` | Univoco globalmente, generabile lato client, no conflitti in sistemi distribuiti |
| `CreatedAt` | `DateTime` | Timestamp creazione, popolato automaticamente da interceptor |
| `UpdatedAt` | `DateTime?` | Nullable perché null alla creazione, popolato su update |

#### Perché `abstract`?

- Non può essere istanziata direttamente
- Forza l'ereditarietà per le entità concrete
- Permette di aggiungere comportamenti comuni

#### Esempio di Utilizzo

```csharp
public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Description { get; set; }
}
```

---

### ISoftDelete.cs

```csharp
namespace CleanApi.Domain.Common;

public interface ISoftDelete
{
    bool IsDeleted { get; set; }
    DateTime? DeletedAt { get; set; }
}
```

#### Cos'è il Soft Delete?

Invece di eliminare fisicamente un record dal database (`DELETE`), si imposta un flag `IsDeleted = true`. Questo permette:

- **Recupero dati** - Possibilità di ripristinare record eliminati
- **Audit** - Tracciabilità di cosa è stato "eliminato"
- **Integrità referenziale** - Nessun problema con foreign key

#### Come Funziona (implementato in Infrastructure)

1. **Interceptor EF Core** - Intercetta le operazioni `Delete` e le converte in `Update`
2. **Query Filter globale** - Esclude automaticamente i record con `IsDeleted = true`

```csharp
// Invece di:
DELETE FROM Products WHERE Id = '...'

// Diventa:
UPDATE Products SET IsDeleted = 1, DeletedAt = GETUTCDATE() WHERE Id = '...'
```

#### Esempio di Utilizzo

```csharp
public class Product : BaseEntity, ISoftDelete
{
    public string Name { get; set; } = string.Empty;

    // ISoftDelete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
```

---

### IAuditable.cs

```csharp
namespace CleanApi.Domain.Common;

public interface IAuditable
{
    string? CreatedBy { get; set; }
    string? UpdatedBy { get; set; }
}
```

#### Cos'è l'Audit Trail?

Traccia **chi** ha creato o modificato un record. Essenziale per:

- **Compliance** - GDPR, SOX, HIPAA richiedono tracciabilità
- **Debug** - Capire chi ha fatto cosa
- **Sicurezza** - Identificare modifiche sospette

#### Come Funziona (implementato in Infrastructure)

1. **ICurrentUserService** - Ottiene l'ID dell'utente corrente dal token JWT
2. **Interceptor EF Core** - Popola automaticamente `CreatedBy`/`UpdatedBy`

```csharp
// Su INSERT:
CreatedBy = currentUserId

// Su UPDATE:
UpdatedBy = currentUserId
```

#### Esempio di Utilizzo

```csharp
public class Product : BaseEntity, IAuditable, ISoftDelete
{
    public string Name { get; set; } = string.Empty;

    // IAuditable
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }

    // ISoftDelete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
```

---

## Eccezioni di Dominio

Le eccezioni di dominio permettono una gestione errori strutturata. Verranno intercettate dal middleware e convertite in risposte HTTP appropriate.

### Mapping Eccezione → HTTP Status

| Eccezione | HTTP Status | Content-Type |
|-----------|-------------|--------------|
| `ValidationException` | 400 Bad Request | ProblemDetails |
| `NotFoundException` | 404 Not Found | ProblemDetails |
| `ForbiddenException` | 403 Forbidden | ProblemDetails |
| `DomainException` | 422 Unprocessable Entity | ProblemDetails |
| `Exception` (generica) | 500 Internal Server Error | ProblemDetails |

---

### DomainException.cs

```csharp
namespace CleanApi.Domain.Exceptions;

public class DomainException : Exception
{
    public DomainException() : base() { }

    public DomainException(string message) : base(message) { }

    public DomainException(string message, Exception innerException)
        : base(message, innerException) { }
}
```

#### Quando Usarla

Per errori di **business logic** che non rientrano nelle altre categorie:

```csharp
// Esempio: regola di business violata
if (order.Total > customer.CreditLimit)
{
    throw new DomainException("Order exceeds customer credit limit");
}
```

---

### NotFoundException.cs

```csharp
namespace CleanApi.Domain.Exceptions;

public class NotFoundException : Exception
{
    public NotFoundException() : base() { }

    public NotFoundException(string message) : base(message) { }

    public NotFoundException(string name, object key)
        : base($"Entity \"{name}\" ({key}) was not found.") { }

    public NotFoundException(string message, Exception innerException)
        : base(message, innerException) { }
}
```

#### Quando Usarla

Quando una risorsa richiesta non esiste:

```csharp
var product = await dbContext.Products.FindAsync(id);
if (product == null)
{
    throw new NotFoundException(nameof(Product), id);
}
// Messaggio: "Entity "Product" (123e4567-e89b-...) was not found."
```

---

### ValidationException.cs

```csharp
namespace CleanApi.Domain.Exceptions;

public class ValidationException : Exception
{
    public IDictionary<string, string[]> Errors { get; }

    public ValidationException() : base("One or more validation failures have occurred.")
    {
        Errors = new Dictionary<string, string[]>();
    }

    public ValidationException(IDictionary<string, string[]> errors)
        : base("One or more validation failures have occurred.")
    {
        Errors = errors;
    }

    public ValidationException(string propertyName, string errorMessage)
        : base("One or more validation failures have occurred.")
    {
        Errors = new Dictionary<string, string[]>
        {
            { propertyName, new[] { errorMessage } }
        };
    }
}
```

#### Quando Usarla

Per errori di validazione input. Il dizionario `Errors` permette di raggruppare errori per campo:

```csharp
var errors = new Dictionary<string, string[]>
{
    { "Email", new[] { "Email is required", "Email format is invalid" } },
    { "Password", new[] { "Password must be at least 8 characters" } }
};
throw new ValidationException(errors);
```

#### Response JSON (generata dal middleware)

```json
{
  "type": "https://tools.ietf.org/html/rfc7807",
  "title": "Bad Request",
  "status": 400,
  "detail": "One or more validation failures have occurred.",
  "errors": {
    "Email": ["Email is required", "Email format is invalid"],
    "Password": ["Password must be at least 8 characters"]
  }
}
```

---

### ForbiddenException.cs

```csharp
namespace CleanApi.Domain.Exceptions;

public class ForbiddenException : Exception
{
    public ForbiddenException() : base("Access to this resource is forbidden.") { }

    public ForbiddenException(string message) : base(message) { }

    public ForbiddenException(string message, Exception innerException)
        : base(message, innerException) { }
}
```

#### Quando Usarla

Quando l'utente è autenticato ma **non autorizzato** ad accedere alla risorsa:

```csharp
if (product.OwnerId != currentUserId)
{
    throw new ForbiddenException("You don't have permission to modify this product");
}
```

#### Differenza tra 401 e 403

| Status | Significato | Eccezione |
|--------|-------------|-----------|
| 401 Unauthorized | Non autenticato (token mancante/invalido) | Gestito da JWT middleware |
| 403 Forbidden | Autenticato ma non autorizzato | `ForbiddenException` |

---

## Pattern: Entità Completa

Ecco come apparirà un'entità completa che utilizza tutte le interfacce:

```csharp
using CleanApi.Domain.Common;

namespace CleanApi.Domain.Entities;

public class Product : BaseEntity, ISoftDelete, IAuditable
{
    // Proprietà di business
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }

    // ISoftDelete (gestito da interceptor)
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    // IAuditable (gestito da interceptor)
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }

    // Comportamenti di dominio
    public void DecreaseStock(int quantity)
    {
        if (quantity > StockQuantity)
        {
            throw new DomainException($"Insufficient stock. Available: {StockQuantity}");
        }
        StockQuantity -= quantity;
    }
}
```

---

## Verifica

```bash
# Build del progetto Domain
dotnet build src/CleanApi.Domain

# Output atteso: Build succeeded, 0 Errors
```

---

## Prossimi Passi

Nel **Phase 3 (Application Layer)** implementeremo:

- `IApplicationDbContext` - Interface per il DbContext
- `ICurrentUserService` - Interface per ottenere l'utente corrente
- `Result<T>` - Pattern per gestione errori senza eccezioni
- Configurazione FluentValidation e Mapster
