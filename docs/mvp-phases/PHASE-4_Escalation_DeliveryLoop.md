# Fase 4 — Escalation, Command Center Gate e Delivery Loop (E5 + E6)

*Dipende da: Fase 3 completata (Risk Register + Scoring + Dossier)*

---

## 1. Obiettivo

Chiudere l'MVP con: escalation automatiche (score-based e hard conditions configurabili), dashboard Command Center per decisioni block/unblock, Risk Review periodiche durante la delivery, e sistema di notifiche in-app + email.

---

## 2. Domain Model

### 2.1 Nuove Entità

```
HardConditionRule
├── Id (Guid)
├── Code (univoco, es. "PENALTY_FIXED_FEE")
├── Name
├── Description
├── ApplicableToMissionTypes (JSON) // ["FixedFee", "TurnKey"]
├── Expression (JSON) // regola valutabile
├── IsActive (bool)
├── SortOrder (int)
└── Implements: BaseEntity, IAuditable

Escalation
├── Id (Guid)
├── AssessmentId (FK)
├── Type: ScoreBased | HardCondition
├── TriggerReason (string) // descrizione leggibile
├── TriggerDetails (JSON) // { riskId, score, threshold } o { ruleCode, matchedValues }
├── Status: Pending | Blocked | Unblocked
├── DecisionByPersonId (FK → Person, nullable)
├── DecisionAt (DateTime, nullable)
├── DecisionNotes (string, nullable)
├── ExecutiveSummary (string) // generato automaticamente
└── Implements: BaseEntity, IAuditable

RiskReview
├── Id (Guid)
├── MissionId (FK)
├── AssessmentId (FK) // assessment corrente collegato
├── ReviewDate (DateTime)
├── ReviewType: Scheduled | AdHoc
├── Status: Planned | InProgress | Completed
├── ConductedByPersonId (FK → Person)
├── Summary (string)
├── Notes
└── Implements: BaseEntity, IAuditable

RiskReviewItem
├── Id (Guid)
├── RiskReviewId (FK)
├── RiskId (FK)
├── PreviousProbability (int)
├── PreviousImpact (int)
├── PreviousScoreWeighted (decimal)
├── NewProbability (int, nullable) // null = invariato
├── NewImpact (int, nullable)
├── NewScoreWeighted (decimal, nullable)
├── StatusChange (RiskStatus, nullable) // es. Open → Mitigated
├── Notes
└── Implements: BaseEntity

ChangeRequest (lightweight, qualitativo in MVP)
├── Id (Guid)
├── MissionId (FK)
├── LinkedRiskId (FK, nullable) // collegamento a rischio scope/requisiti
├── Title
├── Description
├── ImpactOnMargin: None | Low | Medium | High
├── Status: Submitted | Approved | Rejected
├── SubmittedByPersonId (FK)
├── SubmittedAt (DateTime)
└── Implements: BaseEntity, IAuditable

Notification
├── Id (Guid)
├── RecipientPersonId (FK)
├── Type: EscalationCreated | EscalationDecided | ReviewScheduled |
│         MitigationDue | AssessmentStatusChanged | MentionInComment
├── Title
├── Body
├── EntityType (string)
├── EntityId (Guid)
├── IsRead (bool, default false)
├── ReadAt (DateTime, nullable)
├── EmailSent (bool, default false)
├── EmailSentAt (DateTime, nullable)
├── CreatedAt (DateTime)
└── Implements: BaseEntity
```

### 2.2 Enums

```csharp
enum EscalationType { ScoreBased, HardCondition }
enum EscalationStatus { Pending, Blocked, Unblocked }
enum ReviewType { Scheduled, AdHoc }
enum ReviewStatus { Planned, InProgress, Completed }
enum MarginImpact { None, Low, Medium, High }
enum ChangeRequestStatus { Submitted, Approved, Rejected }
enum NotificationType {
    EscalationCreated, EscalationDecided, ReviewScheduled,
    MitigationDue, AssessmentStatusChanged, MentionInComment
}
```

---

## 3. Hard Conditions Engine

### 3.1 Architettura

```
AssessmentApproved / RiskScoreChanged
         │
         ▼
HardConditionsEvaluator
         │
         ├── Carica regole attive per MissionType
         ├── Per ogni regola: valuta Expression vs dati Mission + Assessment + Responses
         ├── Se match → crea Escalation(HardCondition)
         │
         ▼
EscalationService.CreateEscalation()
         │
         ├── Assessment.Status → Escalated
         ├── Genera ExecutiveSummary
         └── NotificationService → notifica CC members
```

### 3.2 Expression Format (JSON)

Le regole sono espressioni valutabili configurabili:

```json
{
  "code": "PENALTY_FIXED_FEE",
  "name": "Penali su Fixed Fee / Turn Key",
  "applicableToMissionTypes": ["FixedFee", "TurnKey"],
  "expression": {
    "operator": "and",
    "conditions": [
      {
        "source": "questionnaire",
        "questionCode": "CONTRACT_TYPE",
        "operator": "equals",
        "value": true
      },
      {
        "source": "questionnaire",
        "questionCode": "SLA_LEVEL",
        "operator": "in",
        "value": ["Stringente", "Mission-critical"]
      }
    ]
  }
}
```

**Source types:**
- `questionnaire` → valore da QuestionnaireResponse
- `mission` → campo dalla Mission (es. `expectedMargin`, `missionType`)
- `risk` → aggregazione sui rischi (es. `maxSeverity`, `countCritical`)

### 3.3 Hard Conditions MVP (6 regole default)

| # | Regola | Condizioni |
|---|---|---|
| 1 | Penali + Fixed/TurnKey | penali presenti AND (SLA stringente) AND tipo in [FixedFee, TurnKey] |
| 2 | Cliente nuovo + Fixed/TurnKey/Reselling | cliente non qualificato AND tipo in [FixedFee, TurnKey, Reselling] |
| 3 | Subcontracting significativo | % subcontracting >= 40% effort |
| 4 | Dati sensibili senza misure | dati sensibili presenti AND security review assente |
| 5 | Tech nuova + dipendenze + deadline stretta | tecnologia nuova AND dipendenza terze parti critica AND go-live < 8 settimane |
| 6 | Margine basso su Fixed/TurnKey | margine atteso < 15% AND tipo in [FixedFee, TurnKey] |

---

## 4. Escalation Workflow

### 4.1 Score-Based Escalation

Trigger automatico quando:
- Un rischio raggiunge severity `Critical` (ScoreWeighted > 22)
- Creazione Escalation con tipo `ScoreBased`
- Assessment.Status rimane invariato fino ad approvazione, poi → Escalated

### 4.2 Hard Condition Escalation

Trigger su:
- Assessment submit (InReview) → valutazione hard conditions
- Assessment approve → ri-valutazione hard conditions
- Se match → Assessment.Status → Escalated

### 4.3 Command Center Decision Flow

```
Escalation(Pending)
     │
     ├── CC visualizza Executive Summary
     ├── CC visualizza Risk Dossier
     ├── CC visualizza dettaglio trigger
     │
     ├── CC decide: Block
     │   ├── Escalation.Status → Blocked
     │   ├── Assessment.Status → Blocked
     │   ├── Notifica BO: "Mission bloccata, motivazione: ..."
     │   └── Mission non può procedere
     │
     └── CC decide: Unblock (con note)
         ├── Escalation.Status → Unblocked
         ├── Assessment.Status → Approved (se era in approvazione)
         ├── Notifica BO: "Mission sbloccata, note CC: ..."
         └── Mission procede

```

### 4.4 Executive Summary (auto-generato)

Template:
```
EXECUTIVE SUMMARY — Escalation {Type}
Mission: {Title} | Cliente: {Client} | Tipo: {MissionType} | Valore: {Value}
Orbit: {OrbitName} | BO: {BOName}

MOTIVO ESCALATION:
- {TriggerReason}

RISK SNAPSHOT:
- Rischi totali: {count} | Critici: {countCritical} | Alti: {countHigh}
- Score medio pesato: {avgWeighted}
- Top 3 rischi: ...

MITIGAZIONI:
- {countPlanned} pianificate | {countInProgress} in corso | {countCompleted} completate
```

---

## 5. Delivery Loop — Risk Review

### 5.1 Workflow

```
PM/TO crea Risk Review (scheduled o ad-hoc)
         │
         ▼
Risk Review(InProgress)
         │
         ├── Per ogni rischio aperto:
         │   ├── Conferma P/I o aggiorna
         │   ├── Aggiorna status (Open → Mitigated → Closed)
         │   └── Note di aggiornamento
         │
         ├── Nuovi rischi emersi → crea Risk manuale
         │
         ├── Link a Change Request (opzionale)
         │
         ▼
Risk Review(Completed)
         │
         ├── Snapshot scores (before/after)
         ├── Ricalcolo severity su rischi aggiornati
         ├── Se nuovo Critical → potenziale nuova Escalation
         └── DossierSnapshot tipo "Review" generabile
```

### 5.2 Change Request (qualitativo MVP)

- Registrazione CR con impatto qualitativo sul margine (None/Low/Medium/High)
- Link opzionale a rischio SCOPE/REQUIREMENTS
- Nessun ricalcolo automatico del margine (solo tracking)
- Visibile nella Mission detail come tab "Change Requests"

---

## 6. Notification System

### 6.1 Architettura

```csharp
public interface INotificationService
{
    Task CreateAsync(NotificationType type, Guid recipientPersonId,
                     string title, string body, string entityType, Guid entityId);
    Task CreateForRoleAsync(NotificationType type, string orgRoleCode,
                            string title, string body, string entityType, Guid entityId);
    Task MarkAsReadAsync(Guid notificationId);
    Task MarkAllAsReadAsync(Guid personId);
    Task<List<NotificationDto>> GetUnreadAsync(Guid personId);
}
```

### 6.2 Trigger Notifiche

| Evento | Destinatari | Tipo |
|---|---|---|
| Escalation creata | Tutti i CC members (GM, CEO) | EscalationCreated |
| CC decide block/unblock | BO della Mission | EscalationDecided |
| Risk Review schedulata | TO, PM della Mission | ReviewScheduled |
| Mitigazione in scadenza (3gg) | Owner mitigazione | MitigationDue |
| Assessment cambia stato | BO, TO, TA | AssessmentStatusChanged |

### 6.3 Email

- Hangfire job: processa notifiche con `EmailSent = false`
- Template email semplice (HTML inline, no engine complesso)
- Configurazione SMTP in `appsettings.json`
- Job schedulato ogni 5 minuti (batch)

### 6.4 Frontend — Notification Bell

- Icona campanella nell'header con badge conteggio unread
- Dropdown con lista notifiche recenti (ultime 20)
- Click → naviga all'entità collegata
- "Segna tutte come lette"
- Polling ogni 30 secondi (o WebSocket in futuro)

---

## 7. API Endpoints

### 7.1 Escalation

```
GET    /api/escalations                          [RequireCapability("CC_VIEW")]
GET    /api/escalations/{id}                     [RequireCapability("CC_VIEW")]
GET    /api/assessments/{aId}/escalations        [RequireCapability("MISSION_VIEW")]
PATCH  /api/escalations/{id}/decide              [RequireCapability("CC_BLOCK")]
       Body: { decision: "Block" | "Unblock", notes: "..." }
```

### 7.2 Hard Condition Rules (admin)

```
GET    /api/hard-condition-rules                 [RequireCapability("CAPABILITY_MANAGE")]
POST   /api/hard-condition-rules                 [RequireCapability("CAPABILITY_MANAGE")]
PUT    /api/hard-condition-rules/{id}            [RequireCapability("CAPABILITY_MANAGE")]
DELETE /api/hard-condition-rules/{id}            [RequireCapability("CAPABILITY_MANAGE")]
```

### 7.3 Risk Review

```
GET    /api/missions/{mId}/reviews               [RequireCapability("MISSION_VIEW")]
GET    /api/risk-reviews/{id}                    [RequireCapability("MISSION_VIEW")]
POST   /api/missions/{mId}/reviews               [RequireCapability("RISK_CRUD")]
PUT    /api/risk-reviews/{id}                    [RequireCapability("RISK_CRUD")]
PATCH  /api/risk-reviews/{id}/complete           [RequireCapability("RISK_CRUD")]

GET    /api/risk-reviews/{id}/items              [RequireCapability("MISSION_VIEW")]
PUT    /api/risk-reviews/{id}/items              [RequireCapability("RISK_CRUD")]
       Body: [{ riskId, newProbability, newImpact, statusChange, notes }]
```

### 7.4 Change Requests

```
GET    /api/missions/{mId}/change-requests       [RequireCapability("MISSION_VIEW")]
POST   /api/missions/{mId}/change-requests       [RequireCapability("RISK_CRUD")]
PUT    /api/change-requests/{id}                 [RequireCapability("RISK_CRUD")]
PATCH  /api/change-requests/{id}/status          [RequireCapability("MISSION_EDIT")]
```

### 7.5 Notifications

```
GET    /api/notifications                        [Authorize] // proprie notifiche
GET    /api/notifications/unread-count           [Authorize]
PATCH  /api/notifications/{id}/read              [Authorize]
PATCH  /api/notifications/read-all               [Authorize]
```

---

## 8. Frontend — Pagine e Componenti

### 8.1 Nuove Route

```
/command-center                  → CC Dashboard (solo CC members)
/command-center/escalations      → Lista escalation
/escalations/{id}                → Dettaglio escalation + decision form
/missions/{id}/reviews           → Tab reviews nella Mission detail
/risk-reviews/{id}               → Review detail con form aggiornamento rischi
/missions/{id}/change-requests   → Tab CR nella Mission detail
```

### 8.2 Command Center Dashboard

**Accesso**: solo utenti con capability `CC_VIEW`

- **Stat cards**: Escalation pendenti, Mission bloccate, Review in ritardo
- **Escalation pendenti**: lista con severity indicator, Mission, tipo, data
- **Timeline decisioni recenti**: block/unblock con note
- **Mission ad alto rischio**: top 5 per score medio pesato

### 8.3 Escalation Detail

- Executive Summary (rendered)
- Trigger details: perché è scattata (score o hard condition)
- Link al Risk Dossier (download)
- Link all'Assessment detail
- **Decision panel** (solo CC):
  - Radio: Block / Unblock
  - Note obbligatorie
  - Conferma con dialog

### 8.4 Risk Review Form

- Lista rischi aperti della Mission
- Per ogni rischio: P/I correnti (readonly) + nuovi P/I (input) + note
- Status change: dropdown (Open, Mitigated, Accepted, Closed)
- Preview: delta score prima/dopo
- "Aggiungi nuovo rischio" inline
- Bottone "Completa Review" → salva tutto + ricalcolo

### 8.5 Notification Bell (Header)

```
src/features/notifications/
├── api.ts
├── hooks.ts          # useUnreadCount(), useNotifications()
├── types.ts
└── components/
    ├── NotificationBell.tsx
    ├── NotificationDropdown.tsx
    └── NotificationItem.tsx
```

### 8.6 Altre Feature Modules

```
src/features/escalations/
├── api.ts, hooks.ts, types.ts
└── components/
    ├── EscalationList.tsx
    ├── EscalationDetail.tsx
    ├── ExecutiveSummaryCard.tsx
    └── DecisionPanel.tsx

src/features/reviews/
├── api.ts, hooks.ts, types.ts
└── components/
    ├── ReviewList.tsx
    ├── ReviewForm.tsx
    └── ReviewItemRow.tsx

src/features/change-requests/
├── api.ts, hooks.ts, types.ts
└── components/
    ├── ChangeRequestList.tsx
    └── ChangeRequestForm.tsx
```

---

## 9. Hangfire Jobs

| Job | Schedule | Azione |
|---|---|---|
| `ProcessNotificationEmailsJob` | Ogni 5 minuti | Invia email per notifiche non ancora inviate |
| `MitigationDueReminderJob` | Giornaliero | Notifica owner di mitigazioni in scadenza (3gg) |
| `ScheduledReviewReminderJob` | Giornaliero | Notifica PM/TO di review pianificate prossime |

---

## 10. Modifiche al Sistema Esistente

- `IApplicationDbContext` → nuovi DbSet: HardConditionRules, Escalations, RiskReviews, RiskReviewItems, ChangeRequests, Notifications
- `Assessment` entity → stato Escalated/Blocked gestito
- Header component → NotificationBell
- Sidebar → sezione "Command Center" (visibile solo con CC_VIEW)
- Mission detail → nuovi tab: Reviews, Change Requests
- `Program.cs` → registrazione nuovi Hangfire jobs
- `appsettings.json` → SMTP settings, notification settings
- Docker → SMTP relay (opzionale, dev: log-to-console)

---

## 11. Acceptance Criteria

| ID | Criterio | Verifica |
|---|---|---|
| AC-ESC-01 | Escalation score-based su rischio Critical | Risk con score > 22 → Escalation creata automaticamente |
| AC-ESC-02 | Escalation hard condition su assessment approve | Hard condition match → Assessment Escalated + notifica CC |
| AC-ESC-03 | CC può bloccare/sbloccare con note obbligatorie | Decision panel funzionante, note salvate |
| AC-ESC-04 | BO vede stato blocco e motivazione | Mission detail mostra stato + note CC |
| AC-ESC-05 | Hard conditions configurabili da admin | CRUD API + UI per gestione regole |
| AC-ESC-06 | Risk Review aggiorna P/I e ricalcola severity | Before/after snapshot, severity aggiornata |
| AC-ESC-07 | Notifiche in-app funzionanti | Bell con conteggio, dropdown, mark as read |
| AC-ESC-08 | Email notifiche inviate | Job Hangfire processa e invia (verificabile in log) |
| AC-ESC-09 | CR linkabile a rischio con impatto qualitativo | Collegamento CR→Risk visibile, impatto tracciato |
| AC-ESC-10 | Dossier snapshot "Review" generabile post-review | Snapshot tipo Review con delta rispetto a precedente |

---

## 12. Effort Stimato

| Area | Complessita | Note |
|---|---|---|
| Hard conditions engine | Alta | Expression evaluator, configurabile, testabile |
| Escalation service + workflow | Alta | State transitions, executive summary, notifiche |
| Command Center UI | Media | Dashboard, detail, decision panel |
| Risk Review service | Media | CRUD + snapshot + ricalcolo |
| Risk Review UI | Media | Form bulk update rischi |
| Change Request | Bassa | CRUD semplice + link a rischio |
| Notification system (BE) | Media | Service + Hangfire jobs + email |
| Notification UI | Media | Bell, dropdown, polling |
| Hard conditions admin UI | Bassa | CRUD + JSON editor |
| Test | Alta | Engine evaluation, escalation flow, edge cases |

---

## 13. MVP Completato — Riepilogo Funzionalita

Al termine della Fase 4, l'MVP copre l'intero flusso:

```
Organization Setup → Mission Creation → Assessment Wizard
        → Risk Register + Scoring → Mitigazioni
        → Escalation (automatica) → CC Decision
        → Delivery Risk Review → Dossier Versionato
        → Notifiche in-app + Email
        → Audit Trail Completo
```

**KPI misurabili dal sistema:**
- % Mission con Risk Dossier pre-offerta
- Tempo medio compilazione assessment
- # escalation (score vs hard) e outcome
- % mitigazioni completate entro scadenza
- # CR e impatto qualitativo
