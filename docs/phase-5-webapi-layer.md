# Phase 5: WebApi Layer

## Obiettivo

Configurare il layer di presentazione:
- Program.cs con DI e middleware pipeline
- Exception Handling con ProblemDetails (RFC 7807)
- Swagger/OpenAPI con autenticazione JWT
- AuthController per register, login, refresh, logout
- Serilog per logging su console

---

## Struttura Creata

```
src/CleanApi.WebApi/
├── Controllers/
│   └── AuthController.cs               # Endpoints autenticazione
├── Middleware/
│   └── ExceptionHandlingMiddleware.cs  # Gestione errori centralizzata
├── Program.cs                          # Entry point e configurazione
├── appsettings.json                    # Configurazione produzione
└── appsettings.Development.json        # Configurazione sviluppo
```

---

## NuGet Packages

| Package | Versione | Scopo |
|---------|----------|-------|
| `Serilog.AspNetCore` | 8.0.3 | Logging strutturato |
| `Swashbuckle.AspNetCore` | 7.2.0 | Swagger UI e OpenAPI |
| `Microsoft.AspNetCore.OpenApi` | 9.0.0 | OpenAPI integration |

---

## Dettaglio Implementazioni

### Program.cs

```csharp
var builder = WebApplication.CreateBuilder(args);

// Serilog
builder.Host.UseSerilog((context, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration));

// Services
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddControllers();

// Swagger con JWT
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token"
    });
    // ...
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

// Middleware pipeline (ordine importante!)
app.UseExceptionHandling();      // 1. Cattura eccezioni
app.UseSwagger/SwaggerUI();      // 2. Solo in Development
app.UseHttpsRedirection();       // 3. Redirect HTTPS
app.UseCors("AllowAll");         // 4. CORS
app.UseAuthentication();         // 5. Valida JWT
app.UseAuthorization();          // 6. Verifica autorizzazioni
app.MapControllers();            // 7. Route ai controller

app.Run();
```

#### Ordine Middleware

L'ordine è critico:

1. **ExceptionHandling** - Deve essere primo per catturare tutto
2. **Swagger** - Solo in development
3. **HTTPS Redirection** - Prima di qualsiasi risposta
4. **CORS** - Prima di Authentication
5. **Authentication** - Valida il token
6. **Authorization** - Verifica i permessi
7. **Controllers** - Esegue le richieste

---

### ExceptionHandlingMiddleware.cs

```csharp
public class ExceptionHandlingMiddleware
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var problemDetails = exception switch
        {
            ValidationException => Status 400,
            NotFoundException => Status 404,
            ForbiddenException => Status 403,
            DomainException => Status 422,
            _ => Status 500
        };
        // ...
    }
}
```

#### Mapping Eccezioni → HTTP Status

| Eccezione | HTTP Status | Tipo Errore |
|-----------|-------------|-------------|
| `ValidationException` | 400 Bad Request | Input non valido |
| `NotFoundException` | 404 Not Found | Risorsa non trovata |
| `ForbiddenException` | 403 Forbidden | Accesso negato |
| `DomainException` | 422 Unprocessable Entity | Regola business violata |
| `Exception` (generico) | 500 Internal Server Error | Errore imprevisto |

#### Formato Risposta (ProblemDetails)

```json
{
  "status": 400,
  "title": "Validation Error",
  "detail": "One or more validation errors occurred.",
  "errors": {
    "Email": ["Email is required"],
    "Password": ["Password must be at least 8 characters"]
  }
}
```

---

### AuthController.cs

| Endpoint | Metodo | Auth | Descrizione |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | No | Registra nuovo utente |
| `/api/auth/login` | POST | No | Login, ritorna JWT |
| `/api/auth/refresh` | POST | No | Rinnova access token |
| `/api/auth/logout` | POST | Si | Invalida refresh token |
| `/api/auth/me` | GET | Si | Info utente corrente |

#### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

Risposta:
```json
{
  "userId": "guid-here"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

Risposta:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "random-base64-string...",
  "expiresAt": "2024-01-15T10:30:00Z"
}
```

#### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "accessToken": "expired-jwt-token",
  "refreshToken": "valid-refresh-token"
}
```

#### Usando Token Autenticato

```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

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
  },
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "Microsoft.EntityFrameworkCore": "Warning"
      }
    },
    "WriteTo": [
      {
        "Name": "Console",
        "Args": {
          "outputTemplate": "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}"
        }
      }
    ]
  }
}
```

#### Configurazione JWT

| Campo | Produzione | Development |
|-------|------------|-------------|
| `AccessTokenExpirationMinutes` | 15 | 60 |
| `RefreshTokenExpirationDays` | 7 | 30 |
| `SecretKey` | Da secrets/env | Hardcoded (ok per dev) |

---

## Swagger UI

Disponibile solo in Development:

- URL: `https://localhost:5001/swagger`
- Autenticazione: Click "Authorize", inserisci token JWT

---

## Verifica

```bash
# Build dell'intera solution
dotnet build

# Avvio applicazione
dotnet run --project src/CleanApi.WebApi

# Swagger UI
# Apri browser: https://localhost:5001/swagger
```

---

## Prossimi Passi

Nel **Phase 6 (Hangfire)** implementeremo:

- Configurazione Hangfire con SQL Server
- Dashboard per monitorare jobs
- Job di esempio per pulizia tokens scaduti
