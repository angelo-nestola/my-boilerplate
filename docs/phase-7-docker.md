# Phase 7: Docker

## Obiettivo

Containerizzare l'applicazione con Docker:
- Dockerfile multi-stage per immagini ottimizzate
- docker-compose per orchestrazione locale
- Health check per monitoring
- Configurazione sicura

---

## File Creati

```
/
├── Dockerfile              # Multi-stage build
├── docker-compose.yml      # Orchestrazione servizi
└── .dockerignore           # File da escludere
```

---

## Dockerfile

### Multi-stage Build

```dockerfile
# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project files and restore
COPY CleanApi.sln ./
COPY src/CleanApi.Domain/CleanApi.Domain.csproj src/CleanApi.Domain/
# ... altri progetti
RUN dotnet restore src/CleanApi.WebApi/CleanApi.WebApi.csproj

# Copy source and publish
COPY src/ src/
RUN dotnet publish -c Release -o /app/publish --no-restore

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Security: non-root user
RUN adduser --disabled-password --gecos '' appuser
COPY --from=build /app/publish .
USER appuser

EXPOSE 8080
ENTRYPOINT ["dotnet", "CleanApi.WebApi.dll"]
```

### Vantaggi Multi-stage

| Aspetto | Single-stage | Multi-stage |
|---------|--------------|-------------|
| Dimensione immagine | ~700MB (con SDK) | ~200MB (solo runtime) |
| Sicurezza | Include strumenti build | Solo runtime necessario |
| Build time | Ogni volta da zero | Cache layer Docker |

---

## docker-compose.yml

### Servizi

```yaml
services:
  webapi:
    build: .
    ports:
      - "8080:8080"
    environment:
      - ConnectionStrings__DefaultConnection=Server=sqlserver;...
      - JwtSettings__SecretKey=your-production-secret
    depends_on:
      sqlserver:
        condition: service_healthy

  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      - ACCEPT_EULA=Y
      - MSSQL_SA_PASSWORD=YourStrong@Passw0rd
    volumes:
      - sqlserver-data:/var/opt/mssql
    healthcheck:
      test: /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "..." -C -Q "SELECT 1"
```

### Configurazione

| Variabile | Descrizione |
|-----------|-------------|
| `ConnectionStrings__DefaultConnection` | Connection string SQL Server |
| `JwtSettings__SecretKey` | Secret per JWT signing |
| `ASPNETCORE_ENVIRONMENT` | Development/Production |

### depends_on con Health Check

```yaml
depends_on:
  sqlserver:
    condition: service_healthy
```

Il container `webapi` attende che SQL Server sia healthy prima di avviarsi.

---

## .dockerignore

```
.git
.vs
**/bin
**/obj
docs/
tools/
*.md
```

Esclude file non necessari per ridurre:
- Tempo di build (meno file da copiare)
- Dimensione context Docker

---

## Health Check

### Endpoint

```csharp
// Program.cs
builder.Services.AddHealthChecks();
app.MapHealthChecks("/health");
```

### Verifica

```bash
curl http://localhost:8080/health
# Response: Healthy
```

### In Docker

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl --fail http://localhost:8080/health || exit 1
```

| Parametro | Valore | Descrizione |
|-----------|--------|-------------|
| `interval` | 30s | Frequenza check |
| `timeout` | 3s | Timeout per risposta |
| `start-period` | 5s | Tempo di avvio container |
| `retries` | 3 | Tentativi prima di `unhealthy` |

---

## Comandi

### Build e Run

```bash
# Build immagine
docker build -t cleanapi .

# Run singolo container
docker run -p 8080:8080 cleanapi

# docker-compose (build + run tutti i servizi)
docker-compose up --build

# docker-compose in background
docker-compose up -d --build

# Stop
docker-compose down

# Stop e rimuovi volumi (ATTENZIONE: cancella dati!)
docker-compose down -v
```

### Logs

```bash
# Tutti i servizi
docker-compose logs -f

# Solo webapi
docker-compose logs -f webapi
```

### Status

```bash
# Container attivi
docker-compose ps

# Health status
docker inspect --format='{{.State.Health.Status}}' cleanapi-webapi
```

---

## Sicurezza

### Non-root User

```dockerfile
RUN adduser --disabled-password --gecos '' appuser
USER appuser
```

Il container non gira come root, riducendo la superficie di attacco.

### Secrets in Produzione

**NON** hardcodare secrets in docker-compose.yml.

Opzioni:
1. **Environment file**: `docker-compose --env-file .env.prod up`
2. **Docker Secrets**: Per Swarm/Kubernetes
3. **Azure Key Vault / AWS Secrets Manager**: Cloud providers

---

## Primo Avvio

```bash
# 1. Build e avvio
docker-compose up --build

# 2. Verifica health
curl http://localhost:8080/health

# 3. Crea migration (se necessario)
docker-compose exec webapi dotnet ef database update

# 4. Swagger UI
# Apri: http://localhost:8080/swagger
```

---

## Troubleshooting

### SQL Server non parte

```bash
# Verifica logs
docker-compose logs sqlserver

# Password troppo semplice? Usa password complessa
MSSQL_SA_PASSWORD=YourStrong@Passw0rd123!
```

### WebApi non si connette a SQL Server

```bash
# Verifica che sqlserver sia healthy
docker-compose ps

# Verifica connection string
docker-compose exec webapi printenv | grep Connection
```

---

## Prossimi Passi

Nel **Phase 8 (Testing & Documentation)** implementeremo:

- Progetto test xUnit
- Test di esempio per validators e services
- CLAUDE.md e README.md finali
