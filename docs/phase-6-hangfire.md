# Phase 6: Hangfire

## Obiettivo

Configurare Hangfire per l'esecuzione di background jobs:
- Storage su SQL Server
- Dashboard per monitoraggio
- Interfaccia astratta per disaccoppiamento
- Job ricorrente di esempio

---

## Struttura Creata

```
src/CleanApi.Application/
└── Common/Interfaces/
    └── IBackgroundJobService.cs       # Interface per background jobs

src/CleanApi.Infrastructure/
└── BackgroundJobs/
    ├── BackgroundJobService.cs        # Implementazione Hangfire
    └── CleanupExpiredTokensJob.cs     # Job esempio (pulizia tokens)
```

---

## NuGet Packages (Infrastructure)

| Package | Versione | Scopo |
|---------|----------|-------|
| `Hangfire.AspNetCore` | 1.8.17 | Integrazione ASP.NET Core |
| `Hangfire.SqlServer` | 1.8.17 | Storage SQL Server |

---

## Dettaglio Implementazioni

### IBackgroundJobService.cs

```csharp
public interface IBackgroundJobService
{
    // Fire-and-forget
    string Enqueue(Expression<Action> methodCall);
    string Enqueue<T>(Expression<Action<T>> methodCall);

    // Delayed
    string Schedule(Expression<Action> methodCall, TimeSpan delay);
    string Schedule<T>(Expression<Action<T>> methodCall, TimeSpan delay);

    // Recurring
    void AddOrUpdateRecurring(string jobId, Expression<Action> methodCall, string cronExpression);
    void AddOrUpdateRecurring<T>(string jobId, Expression<Action<T>> methodCall, string cronExpression);
    void RemoveRecurring(string jobId);
}
```

#### Tipi di Job

| Tipo | Metodo | Descrizione |
|------|--------|-------------|
| Fire-and-forget | `Enqueue` | Esegui immediatamente in background |
| Delayed | `Schedule` | Esegui dopo un delay specificato |
| Recurring | `AddOrUpdateRecurring` | Esegui secondo cron expression |

---

### BackgroundJobService.cs

Implementazione che wrappa le API statiche di Hangfire:

```csharp
public class BackgroundJobService : IBackgroundJobService
{
    public string Enqueue(Expression<Action> methodCall)
    {
        return BackgroundJob.Enqueue(methodCall);
    }

    public void AddOrUpdateRecurring<T>(string jobId, Expression<Action<T>> methodCall, string cronExpression)
    {
        RecurringJob.AddOrUpdate(jobId, methodCall, cronExpression);
    }
    // ...
}
```

---

### CleanupExpiredTokensJob.cs

Job ricorrente che pulisce i refresh tokens scaduti:

```csharp
public class CleanupExpiredTokensJob
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CleanupExpiredTokensJob> _logger;

    public async Task ExecuteAsync()
    {
        _logger.LogInformation("Starting cleanup of expired refresh tokens");

        var expiredUsers = await _context.Users
            .Where(u => u.RefreshTokenExpiryTime != null &&
                       u.RefreshTokenExpiryTime < DateTime.UtcNow)
            .ToListAsync();

        foreach (var user in expiredUsers)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Cleaned up {Count} expired refresh tokens", expiredUsers.Count);
    }
}
```

---

### Configurazione DI (Infrastructure)

```csharp
// In DependencyInjection.cs
services.AddHangfire(config => config
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseSqlServerStorage(connectionString, new SqlServerStorageOptions
    {
        CommandBatchMaxTimeout = TimeSpan.FromMinutes(5),
        SlidingInvisibilityTimeout = TimeSpan.FromMinutes(5),
        QueuePollInterval = TimeSpan.Zero,
        UseRecommendedIsolationLevel = true,
        DisableGlobalLocks = true,
        SchemaName = "HangFire"
    }));

services.AddHangfireServer();
services.AddScoped<IBackgroundJobService, BackgroundJobService>();
services.AddScoped<CleanupExpiredTokensJob>();
```

#### SqlServerStorageOptions

| Opzione | Valore | Descrizione |
|---------|--------|-------------|
| `SchemaName` | "HangFire" | Schema SQL Server dedicato |
| `DisableGlobalLocks` | true | Migliori performance in cluster |
| `QueuePollInterval` | Zero | Usa SignalR invece di polling |

---

### Configurazione WebApi (Program.cs)

```csharp
// Hangfire Dashboard (development only)
if (app.Environment.IsDevelopment())
{
    app.MapHangfireDashboard("/hangfire");
}

// Configure recurring jobs
RecurringJob.AddOrUpdate<CleanupExpiredTokensJob>(
    "cleanup-expired-tokens",
    job => job.ExecuteAsync(),
    Cron.Daily);
```

---

## Dashboard

URL: `https://localhost:5001/hangfire`

Disponibile solo in Development. Features:

- **Jobs** - Lista di tutti i job (pending, processing, succeeded, failed)
- **Retries** - Job falliti con tentativi di retry
- **Recurring Jobs** - Job schedulati con cron expression
- **Servers** - Worker Hangfire attivi

---

## Cron Expressions

| Expression | Significato |
|------------|-------------|
| `Cron.Minutely` | Ogni minuto |
| `Cron.Hourly` | Ogni ora |
| `Cron.Daily` | Ogni giorno a mezzanotte |
| `Cron.Weekly` | Ogni settimana (domenica) |
| `Cron.Monthly` | Primo giorno del mese |
| `"0 9 * * *"` | Ogni giorno alle 9:00 |
| `"*/15 * * * *"` | Ogni 15 minuti |

---

## Utilizzo

### Fire-and-forget

```csharp
public class OrderService
{
    private readonly IBackgroundJobService _jobs;

    public async Task CreateOrder(Order order)
    {
        await _context.Orders.AddAsync(order);
        await _context.SaveChangesAsync();

        // Invia email in background
        _jobs.Enqueue<EmailService>(x => x.SendOrderConfirmation(order.Id));
    }
}
```

### Delayed Job

```csharp
// Invia reminder dopo 24 ore
_jobs.Schedule<EmailService>(
    x => x.SendPaymentReminder(orderId),
    TimeSpan.FromHours(24));
```

### Recurring Job

```csharp
// Report giornaliero alle 6:00
_jobs.AddOrUpdateRecurring<ReportService>(
    "daily-sales-report",
    x => x.GenerateDailySalesReport(),
    "0 6 * * *");
```

---

## Database

Hangfire crea automaticamente le tabelle necessarie nello schema `[HangFire]`:

- `[HangFire].[Job]` - Jobs in coda
- `[HangFire].[State]` - Stati dei jobs
- `[HangFire].[Server]` - Worker registrati
- `[HangFire].[Set]` - Recurring jobs

---

## Verifica

```bash
# Build solution
dotnet build

# Avvia applicazione
dotnet run --project src/CleanApi.WebApi

# Dashboard Hangfire
# Apri browser: https://localhost:5001/hangfire
```

---

## Prossimi Passi

Nel **Phase 7 (Docker)** implementeremo:

- Dockerfile multi-stage
- docker-compose con SQL Server
- Configurazione environment variables
