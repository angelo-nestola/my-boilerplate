# TrelloSync

CLI tool per sincronizzare task di sviluppo da file YAML a Trello.

## Configurazione

### 1. Ottenere credenziali Trello

1. Vai su https://trello.com/app-key
2. Copia l'**API Key**
3. Clicca su "Token" per generare un token con permessi di lettura/scrittura
4. Copia il **Token**

### 2. Configurare le credenziali

Crea il file `appsettings.Development.json`:

```json
{
  "Trello": {
    "ApiKey": "YOUR_API_KEY_HERE",
    "Token": "YOUR_TOKEN_HERE"
  }
}
```

> **Nota**: Questo file e in `.gitignore` e non verra committato.

## Comandi

### init

Inizializza la board Trello con liste e labels.

```bash
dotnet run --project tools/TrelloSync -- init
```

Crea:
- Board con nome da `appsettings.json` (default: "CleanApi")
- Liste: Backlog, To Do, In Progress, Done
- File `.trello-sync.json` con mapping IDs

### push

Sincronizza i task da `tasks/plan.yaml` a Trello.

```bash
dotnet run --project tools/TrelloSync -- push
```

Azioni:
- Crea nuove card per task non esistenti
- Aggiorna card esistenti (titolo, descrizione)
- Sposta card nella lista corretta in base allo status
- Crea labels per le fasi
- Aggiunge checklist con subtasks

### status

Mostra le differenze tra YAML locale e Trello.

```bash
dotnet run --project tools/TrelloSync -- status
```

Output:
- Task nuovi (non su Trello)
- Cambiamenti di status (card spostate su Trello)
- Card orfane (su Trello ma non nel plan)

### pull-status

Legge lo status delle card da Trello.

```bash
# Solo report
dotnet run --project tools/TrelloSync -- pull-status

# Applica modifiche a plan.yaml
dotnet run --project tools/TrelloSync -- pull-status --apply
```

## Struttura plan.yaml

```yaml
project: CleanApi
version: "1.0"

phases:
  - id: phase-1
    name: "Phase 1: Setup"
    tasks:
      - id: task-1-1
        title: "Setup solution"
        description: |
          Descrizione dettagliata del task.
        status: backlog    # backlog | todo | in_progress | done
        labels:
          - setup
        subtasks:
          - Subtask 1
          - Subtask 2
```

## Status Mapping

| YAML | Trello List |
|------|-------------|
| `backlog` | Backlog |
| `todo` | To Do |
| `in_progress` | In Progress |
| `done` | Done |

## File generati

| File | Descrizione |
|------|-------------|
| `tasks/plan.yaml` | Definizione task (versionato) |
| `tasks/.trello-sync.json` | Mapping IDs Trello (git-ignored) |
