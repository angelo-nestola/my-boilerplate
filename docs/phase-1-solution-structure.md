# Phase 1: Solution Structure

## Obiettivo

Creare la struttura base della solution seguendo i principi della Clean Architecture, garantendo:
- Separazione delle responsabilità tra layer
- Dipendenze che puntano verso l'interno (Dependency Inversion)
- Testabilità del codice
- Indipendenza dal framework nel Domain layer

---

## Clean Architecture Overview

La Clean Architecture organizza il codice in layer concentrici dove le dipendenze puntano sempre verso l'interno:

```
┌─────────────────────────────────────────────────────────────┐
│                         WebApi                               │
│  Presentation layer: Controllers, Middleware, Filters        │
│  Dipende da: Infrastructure, Application                     │
├─────────────────────────────────────────────────────────────┤
│                      Infrastructure                          │
│  External concerns: Database, Identity, External APIs        │
│  Dipende da: Application, Domain                             │
├─────────────────────────────────────────────────────────────┤
│                       Application                            │
│  Business logic: Services, DTOs, Validators                  │
│  Dipende da: Domain                                          │
├─────────────────────────────────────────────────────────────┤
│                         Domain                               │
│  Core business: Entities, Value Objects, Interfaces          │
│  Dipende da: Nulla (è il centro)                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Progetti Creati

### CleanApi.Domain

| Attributo | Valore |
|-----------|--------|
| Tipo | Class Library |
| Framework | .NET 9 |
| Dipendenze | Nessuna |
| Scopo | Entità, Value Objects, Interfacce base, Eccezioni |

**Principi:**
- Nessuna dipendenza da framework esterni
- Contiene solo logica di business pura
- Le entità hanno comportamenti, non sono semplici DTO

**Contenuto tipico:**
- `Common/` - Classi base (BaseEntity, interfacce)
- `Entities/` - Entità di dominio
- `ValueObjects/` - Value Objects immutabili
- `Exceptions/` - Eccezioni di dominio

---

### CleanApi.Application

| Attributo | Valore |
|-----------|--------|
| Tipo | Class Library |
| Framework | .NET 9 |
| Dipendenze | Domain |
| Scopo | Use cases, Services, DTOs, Validators, Interfaces |

**Principi:**
- Contiene la logica applicativa (orchestrazione)
- Definisce interfacce implementate da Infrastructure
- Non conosce dettagli di persistenza o framework

**Contenuto tipico:**
- `Common/Interfaces/` - IApplicationDbContext, IIdentityService
- `Common/Models/` - Result pattern, PaginatedList
- `Features/` - Organizzazione per feature/domain
- `DependencyInjection.cs` - Registrazione servizi

---

### CleanApi.Infrastructure

| Attributo | Valore |
|-----------|--------|
| Tipo | Class Library |
| Framework | .NET 9 |
| Dipendenze | Application, Domain (transitiva) |
| Scopo | Implementazioni concrete, Database, Identity, External Services |

**Principi:**
- Implementa le interfacce definite in Application
- Contiene tutti i dettagli tecnici (EF Core, Identity, etc.)
- Può essere sostituito senza modificare Application/Domain

**Contenuto tipico:**
- `Data/` - DbContext, Configurations, Migrations, Interceptors
- `Identity/` - IdentityService, JwtService
- `Services/` - Implementazioni servizi esterni
- `DependencyInjection.cs` - Registrazione servizi

---

### CleanApi.WebApi

| Attributo | Valore |
|-----------|--------|
| Tipo | ASP.NET Core Web API |
| Framework | .NET 9 |
| Dipendenze | Infrastructure, Application (transitiva) |
| Scopo | Entry point HTTP, Controllers, Middleware, Configuration |

**Principi:**
- Sottile: solo routing e configurazione
- Delega tutto ad Application layer
- Gestisce cross-cutting concerns (auth, logging, errors)

**Contenuto tipico:**
- `Controllers/` - REST endpoints
- `Middleware/` - Exception handling, logging
- `Filters/` - Validation, Authorization filters
- `Program.cs` - DI configuration, middleware pipeline

---

### CleanApi.UnitTests

| Attributo | Valore |
|-----------|--------|
| Tipo | xUnit Test Project |
| Framework | .NET 9 |
| Dipendenze | Application |
| Scopo | Unit tests per Application layer |

**Principi:**
- Testa la business logic in isolamento
- Usa mock per le dipendenze esterne
- Non richiede database o servizi esterni

---

## Grafo delle Dipendenze

```
                    ┌──────────────┐
                    │   WebApi     │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │Infrastructure│
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Application  │◄────── UnitTests
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    Domain    │
                    └──────────────┘
```

**Regola fondamentale:** Un layer può dipendere solo da layer più interni, mai da layer esterni.

---

## Struttura Directory Finale

```
CleanApi/
├── src/
│   ├── CleanApi.Domain/
│   │   ├── CleanApi.Domain.csproj
│   │   ├── Common/
│   │   ├── Entities/
│   │   ├── ValueObjects/
│   │   └── Exceptions/
│   │
│   ├── CleanApi.Application/
│   │   ├── CleanApi.Application.csproj
│   │   ├── Common/
│   │   │   ├── Interfaces/
│   │   │   ├── Models/
│   │   │   ├── Mappings/
│   │   │   └── Behaviors/
│   │   ├── Features/
│   │   └── DependencyInjection.cs
│   │
│   ├── CleanApi.Infrastructure/
│   │   ├── CleanApi.Infrastructure.csproj
│   │   ├── Data/
│   │   │   ├── ApplicationDbContext.cs
│   │   │   ├── Configurations/
│   │   │   ├── Interceptors/
│   │   │   └── Migrations/
│   │   ├── Identity/
│   │   ├── Services/
│   │   └── DependencyInjection.cs
│   │
│   └── CleanApi.WebApi/
│       ├── CleanApi.WebApi.csproj
│       ├── Controllers/
│       ├── Middleware/
│       ├── Filters/
│       ├── Program.cs
│       ├── appsettings.json
│       └── Dockerfile
│
├── tests/
│   └── CleanApi.UnitTests/
│       ├── CleanApi.UnitTests.csproj
│       └── Application/
│
├── tools/
│   └── TrelloSync/
│
├── tasks/
│   └── plan.yaml
│
├── docs/
│
├── CleanApi.sln
├── ARCHITECTURE.md
└── README.md
```

---

## Comandi Utilizzati

### Creazione Solution

```bash
dotnet new sln -n CleanApi
```

### Creazione Progetti

```bash
# Domain - nessun framework reference
dotnet new classlib -n CleanApi.Domain -o src/CleanApi.Domain -f net9.0

# Application - referenzia Domain
dotnet new classlib -n CleanApi.Application -o src/CleanApi.Application -f net9.0

# Infrastructure - referenzia Application (e transitivamente Domain)
dotnet new classlib -n CleanApi.Infrastructure -o src/CleanApi.Infrastructure -f net9.0

# WebApi - referenzia Infrastructure (e transitivamente tutti)
dotnet new webapi -n CleanApi.WebApi -o src/CleanApi.WebApi -f net9.0 --no-openapi

# UnitTests - referenzia Application per testare la business logic
dotnet new xunit -n CleanApi.UnitTests -o tests/CleanApi.UnitTests -f net9.0
```

### Aggiunta alla Solution

```bash
dotnet sln CleanApi.sln add src/CleanApi.Domain/CleanApi.Domain.csproj
dotnet sln CleanApi.sln add src/CleanApi.Application/CleanApi.Application.csproj
dotnet sln CleanApi.sln add src/CleanApi.Infrastructure/CleanApi.Infrastructure.csproj
dotnet sln CleanApi.sln add src/CleanApi.WebApi/CleanApi.WebApi.csproj
dotnet sln CleanApi.sln add tests/CleanApi.UnitTests/CleanApi.UnitTests.csproj
```

### Configurazione References

```bash
# Application → Domain
dotnet add src/CleanApi.Application/CleanApi.Application.csproj \
    reference src/CleanApi.Domain/CleanApi.Domain.csproj

# Infrastructure → Application (include Domain transitivamente)
dotnet add src/CleanApi.Infrastructure/CleanApi.Infrastructure.csproj \
    reference src/CleanApi.Application/CleanApi.Application.csproj

# WebApi → Infrastructure (include Application e Domain transitivamente)
dotnet add src/CleanApi.WebApi/CleanApi.WebApi.csproj \
    reference src/CleanApi.Infrastructure/CleanApi.Infrastructure.csproj

# UnitTests → Application (per testare la business logic)
dotnet add tests/CleanApi.UnitTests/CleanApi.UnitTests.csproj \
    reference src/CleanApi.Application/CleanApi.Application.csproj
```

---

## Verifica

```bash
# Build intera solution
dotnet build CleanApi.sln

# Output atteso: Build succeeded, 0 Errors
```

---

## Riferimenti

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Microsoft - Clean Architecture with ASP.NET Core](https://docs.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures)
