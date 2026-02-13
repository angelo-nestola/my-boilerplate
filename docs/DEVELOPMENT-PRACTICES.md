# Development Practices - Risk Management Platform

Questo documento definisce le pratiche di sviluppo, i pattern, i comandi e le convenzioni adottate nel progetto. Va consultato ad ogni sessione di sviluppo per garantire coerenza.

---

## 1. Architettura

### Clean Architecture

```
Domain ← Application ← Infrastructure ← WebApi
```

| Layer | Responsabilita | Dipendenze |
|---|---|---|
| **Domain** | Entita, interfacce, enum, eccezioni | Nessuna |
| **Application** | DTOs, service interfaces, validators | Domain |
| **Infrastructure** | EF Core, Identity, servizi, interceptor | Domain, Application |
| **WebApi** | Controller, middleware, configurazione | Tutti |

### Struttura progetto

```
src/
├── CleanApi.Domain/           # Entita, Common (BaseEntity, ISoftDelete, IAuditable), Enums, Exceptions
├── CleanApi.Application/      # Features/<Feature>/ (DTOs, interfaces, validators), Common/
├── CleanApi.Infrastructure/   # Data/ (DbContext, Configurations, Migrations, Interceptors), Services/, Identity/, Authorization/
└── CleanApi.WebApi/           # Controllers/, Middleware/, Program.cs

tests/
└── CleanApi.UnitTests/        # <Feature>/ con test xUnit

frontend/
└── src/
    ├── app/(dashboard)/       # Pages (Next.js App Router)
    ├── features/              # Feature modules (api, types, hooks, components)
    ├── components/            # Shared components (ui, auth)
    ├── hooks/                 # Custom hooks globali
    ├── lib/                   # Utilities (axios, constants, queryClient)
    └── config/                # Menu, theme
```

---

## 2. Comandi di sviluppo

### Backend (.NET 9)

```bash
# Build (da WSL, via cmd.exe)
cmd.exe /c "cd /d C:\Users\angelo.nestola\Desktop\Personal\Development\BoilerPlate && dotnet build"

# Run
cmd.exe /c "cd /d C:\Users\angelo.nestola\Desktop\Personal\Development\BoilerPlate && dotnet run --project src/CleanApi.WebApi"

# Test
cmd.exe /c "cd /d C:\Users\angelo.nestola\Desktop\Personal\Development\BoilerPlate && dotnet test"

# Creare migration
cmd.exe /c "cd /d C:\Users\angelo.nestola\Desktop\Personal\Development\BoilerPlate && dotnet ef migrations add <NomeMigration> --project src/CleanApi.Infrastructure --startup-project src/CleanApi.WebApi"

# Applicare migration
cmd.exe /c "cd /d C:\Users\angelo.nestola\Desktop\Personal\Development\BoilerPlate && dotnet ef database update --project src/CleanApi.Infrastructure --startup-project src/CleanApi.WebApi"

# Rimuovere ultima migration (se non applicata)
cmd.exe /c "cd /d C:\Users\angelo.nestola\Desktop\Personal\Development\BoilerPlate && dotnet ef migrations remove --project src/CleanApi.Infrastructure --startup-project src/CleanApi.WebApi"

# Drop database (ATTENZIONE: distruttivo)
cmd.exe /c "cd /d C:\Users\angelo.nestola\Desktop\Personal\Development\BoilerPlate && dotnet ef database drop --force --project src/CleanApi.Infrastructure --startup-project src/CleanApi.WebApi"
```

> **Nota**: `dotnet` non e disponibile direttamente in WSL, va invocato tramite `cmd.exe /c`.

### Frontend (Next.js 16 + React 19)

```bash
cd frontend

# Dev server
npm run dev

# Build produzione
npm run build

# Lint
npm run lint

# Installare dipendenze
npm install <pacchetto>
```

### Docker

```bash
# SQL Server container
docker-compose up -d sqlserver

# Stato container
docker ps --filter "name=sqlserver"

# Restart SQL Server
docker restart cleanapi-sqlserver

# Log SQL Server
docker logs cleanapi-sqlserver --tail 20
```

---

## 3. Design Pattern

### Result Pattern

Ogni operazione di servizio ritorna `Result<T>` invece di lanciare eccezioni per fallimenti attesi.

```csharp
// Service
public async Task<Result<OrgUnitDto>> CreateAsync(CreateOrgUnitDto dto, CancellationToken ct)
{
    if (exists) return Result<OrgUnitDto>.Failure("Already exists");
    // ...
    return Result<OrgUnitDto>.Success(new OrgUnitDto { ... });
}

// Controller
var result = await _service.CreateAsync(dto, ct);
if (!result.Succeeded) return BadRequest(new { error = string.Join(", ", result.Errors) });
return Ok(result.Value);
```

### Base Entity + Interfaces

```csharp
// Ogni entita eredita da BaseEntity
public class MyEntity : BaseEntity, ISoftDelete, IAuditable
{
    // Proprieta specifiche
    public required string Name { get; set; }

    // ISoftDelete
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    // IAuditable
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}
```

- `BaseEntity`: Id (Guid), CreatedAt, UpdatedAt
- `ISoftDelete`: IsDeleted, DeletedAt (gestito da SoftDeleteInterceptor)
- `IAuditable`: CreatedBy, UpdatedBy (gestito da AuditableInterceptor)

### Capability-Based Authorization

Autorizzazione granulare basata su capability, non su ruoli. Il flusso:

```
User (JWT) → Person → OrgAssignments → OrgRoles → RoleCapabilities → Capability codes
```

```csharp
// Backend: attributo sul controller
[RequireCapability("ORGUNIT_MANAGE")]
public async Task<IActionResult> Create(...)

// Frontend: componente condizionale
<Can capability="ORGUNIT_MANAGE">
  <Button>Create Unit</Button>
</Can>

// Frontend: hook
const canManage = useCapability('ORGUNIT_MANAGE');
```

### Exception Handling

Eccezioni custom mappate a status HTTP (gestite dal middleware globale):

| Exception | HTTP Status |
|---|---|
| `ValidationException` | 400 Bad Request |
| `NotFoundException` | 404 Not Found |
| `ForbiddenException` | 403 Forbidden |
| `DomainException` | 422 Unprocessable Entity |

---

## 4. Convenzioni Backend

### Aggiungere una nuova feature

1. **Domain**: Entita in `Domain/Entities/`, enum in `Domain/Enums/`
2. **Application**: DTOs e interfacce in `Application/Features/<Feature>/`
3. **Infrastructure**:
   - DbSet in `IApplicationDbContext` e `ApplicationDbContext`
   - Configurazione EF in `Infrastructure/Data/Configurations/`
   - Servizio in `Infrastructure/Services/`
   - Registrazione DI in `Infrastructure/DependencyInjection.cs`
4. **WebApi**: Controller in `WebApi/Controllers/`
5. **Migration**: `dotnet ef migrations add <Nome>`
6. **Test**: In `tests/CleanApi.UnitTests/<Feature>/`

### Naming conventions

- **Entita**: PascalCase singolare (`Person`, `OrgUnit`)
- **DTOs**: `<Entity>Dto`, `Create<Entity>Dto`, `Update<Entity>Dto`, `<Entity>ListDto`
- **Service interface**: `I<Entity>Service` in Application
- **Service implementation**: `<Entity>Service` in Infrastructure
- **Controller**: `<Entity>sController` (plurale)
- **Test**: `<ServiceName>Tests`, metodi: `MethodName_Scenario_ExpectedResult`

### EF Core Configuration

```csharp
public class MyEntityConfiguration : IEntityTypeConfiguration<MyEntity>
{
    public void Configure(EntityTypeBuilder<MyEntity> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        // Indici, relazioni, ecc.
    }
}
```

### DesignTimeDbContextFactory

Presente in `Infrastructure/Data/DesignTimeDbContextFactory.cs`. Permette a `dotnet ef` di creare il DbContext senza avviare l'intera applicazione (evita timeout su connessione DB e seeder).

### Dipendenze circolari DI

Risolta con risoluzione lazy via `IServiceProvider`:

```csharp
// SBAGLIATO: causa dipendenza circolare
public MyService(IApplicationDbContext context) { }

// CORRETTO: risoluzione lazy
public MyService(IServiceProvider serviceProvider) {
    var context = serviceProvider.GetRequiredService<IApplicationDbContext>();
}
```

Usato in `CurrentUserService` e `DbSeeder`.

---

## 5. Convenzioni Frontend

### Feature Module Pattern

Ogni feature e auto-contenuta nella sua cartella:

```
features/<feature>/
├── types.ts      # Interfacce TypeScript
├── api.ts        # Chiamate API (axios)
├── hooks.ts      # React Query hooks (useQuery, useMutation)
├── index.ts      # Barrel export
└── *.tsx         # Componenti specifici della feature
```

### React Query

- **Query keys**: organizzati con factory `orgKeys` per invalidazione precisa
- **Stale time**: 5 minuti
- **GC time**: 10 minuti
- **Retry**: 1 per query, 0 per mutation
- **Invalidation**: ogni mutation invalida le query correlate

```typescript
// Query keys factory
export const orgKeys = {
  all: ['organization'] as const,
  units: () => [...orgKeys.all, 'units'] as const,
  unitDetail: (id: string) => [...orgKeys.units(), id] as const,
};

// Hook
export function useOrgUnits(search?: string, type?: OrgUnitType) {
  return useQuery({
    queryKey: orgKeys.unitList(search, type),
    queryFn: () => orgApi.getOrgUnits(search, type),
  });
}
```

### Axios Client

- Token JWT da localStorage aggiunto automaticamente via interceptor
- Refresh token automatico su 401
- Redirect a login se refresh fallisce

### MUI v7

- **Grid**: in MUI v7 `Grid2` e stato rinominato in `Grid`. Usare sempre `Grid` con prop `size`.
- **Responsive**: `useMediaQuery` per layout mobile vs desktop
- **DataGrid**: da `@mui/x-data-grid` per tabelle

### Componenti condivisi

- `<Can capability="CODE">` per contenuto protetto
- `useCapability(code)` per check singolo
- `useAnyCapability(...codes)` per check multiplo (OR)
- `useAllCapabilities(...codes)` per check multiplo (AND)
- Toast notifications via `useToast()` nelle mutation

---

## 6. Stack tecnologico

### Backend
| Tecnologia | Versione | Uso |
|---|---|---|
| .NET | 9.0 | Runtime |
| ASP.NET Core | 9.0 | Web framework |
| Entity Framework Core | 9.x | ORM |
| SQL Server | 2022 | Database (Docker) |
| ASP.NET Core Identity | 9.x | Autenticazione |
| JWT Bearer | - | Token auth |
| Hangfire | - | Background jobs |
| Serilog | - | Logging |
| xUnit | - | Testing |
| NSubstitute | - | Mocking |
| FluentAssertions | - | Test assertions |

### Frontend
| Tecnologia | Versione | Uso |
|---|---|---|
| Next.js | 16.1.6 | Framework React (App Router) |
| React | 19.2.3 | UI library |
| TypeScript | 5.x | Type safety |
| MUI (Material UI) | 7.3.7 | Component library |
| MUI X DataGrid | 8.27.0 | Tabelle avanzate |
| TanStack React Query | 5.90.20 | Data fetching + caching |
| Axios | 1.13.4 | HTTP client |
| react-organizational-chart | 2.2.1 | Organigramma |

### Infrastruttura
| Tecnologia | Uso |
|---|---|
| Docker | SQL Server container |
| WSL2 | Ambiente di sviluppo |

---

## 7. Configurazione ambiente

### Connection String

```
Server=localhost;Database=RiskPlatformDb;User Id=sa;Password=YourStrong@Passw0rd;MultipleActiveResultSets=true;TrustServerCertificate=True;Connect Timeout=5
```

Definita in `appsettings.json` e sovrascritta da `appsettings.Development.json`.

### Docker SQL Server

- Container: `cleanapi-sqlserver`
- Porta: `1433`
- Credenziali: `sa` / `YourStrong@Passw0rd`
- Healthcheck: `/opt/mssql-tools/bin/sqlcmd` (NON mssql-tools18)

### Admin seed

- Email: `admin@riskplatform.com`
- Password: `Admin123!`
- Ruolo: `PLATFORM_ADMIN` (tutte le capability)

### Backend URLs

- HTTPS: `https://localhost:7268`
- HTTP: `http://localhost:5267`
- Swagger: `https://localhost:7268/swagger`

---

## 8. Testing

### Unit Test

```csharp
// Naming: MethodName_Scenario_ExpectedResult
[Fact]
public async Task CreateAsync_DuplicateEmail_ShouldFail()
{
    // Arrange
    var context = CreateInMemoryContext();
    var service = new PersonService(context);

    // Act
    var result = await service.CreateAsync(dto);

    // Assert
    result.Succeeded.Should().BeFalse();
    result.Errors.Should().Contain(e => e.Contains("duplicate"));
}
```

- Mock `IApplicationDbContext` con InMemory database o NSubstitute
- Ogni feature ha la sua cartella di test
- Usare FluentAssertions per asserzioni leggibili

### API Test manuali (Swagger)

1. `POST /api/auth/login` con credenziali admin
2. Copiare il token JWT
3. Autorizzarsi in Swagger (Authorize > Bearer token)
4. Testare gli endpoint

---

## 9. Seed e struttura organizzativa

### Struttura seedata

```
Command Center (StaffGroup)          ← admin assegnato qui
├── Technical Hub (TechnicalHub)     ← governa i CC
├── Talent Based (StaffGroup)        ← onboarding, recruiting
└── HR (StaffGroup)                  ← risorse umane
```

### Ruoli organizzativi seedati

| Codice | Descrizione |
|---|---|
| CEO | Chief Executive Officer |
| GENERAL_MANAGER | General Manager |
| BUSINESS_MANAGER | Responsabile di tutti i Business Leader, può guidare un Orbit |
| BUSINESS_LEADER | Business Leader / Orbit Lead |
| TECHNICAL_ARCHITECT | Technical Architect |
| TECHNICAL_SUPPORT | Technical Support |
| COMPETENCE_LEAD | Competence Center Lead |
| TALENT_LEAD | Talent Based Lead |
| TALENT_SPECIALIST | Talent Based Specialist |
| HR_LEAD | Human Resources Lead |
| HR_SPECIALIST | Human Resources Specialist |
| ADMINISTRATION_LEAD | Administration Lead |
| ADMINISTRATION_SPECIALIST | Administration Specialist |
| MARKETING_LEAD | Marketing Lead |
| MARKETING_SPECIALIST | Marketing Specialist |
| PLATFORM_ADMIN | Amministratore applicativo (tutte le capability) |

### Tipi OrgUnit

| Tipo | Descrizione |
|---|---|
| Orbit | Unita trasversale per area di mercato |
| CompetenceCenter | Centro di competenza per dominio tecnologico |
| TechnicalHub | Organo orizzontale che governa i CC |
| StaffGroup | Organo di staff (Command Center, Talent Based, HR) |
