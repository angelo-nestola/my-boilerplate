# Fase 3 — Risk Register, Scoring, Mitigazioni e Report (E3 + E4)

*Dipende da: Fase 2 completata (Mission + Assessment)*

---

## 1. Obiettivo

Implementare il cuore del risk management: registro rischi con scoring pesato automatico, azioni di mitigazione tracciate, audit log esplicito con diff, e generazione del Risk Dossier PDF versionato.

---

## 2. Domain Model

### 2.1 Nuove Entità

```
RiskCategory (lookup configurabile)
├── Id (Guid)
├── Code (univoco, es. "CONTRACT_SLA")
├── Name (es. "Contrattuale / SLA / Penali")
├── Description
├── DefaultWeight (decimal, es. 1.5)
├── SortOrder (int)
└── Implements: BaseEntity

Risk
├── Id (Guid)
├── AssessmentId (FK)
├── CategoryId (FK → RiskCategory)
├── Title
├── Description
├── Probability (int, 1-5)
├── Impact (int, 1-5)
├── ScoreBase (computed: P × I)
├── CategoryWeight (decimal, snapshot del peso al momento della creazione)
├── ScoreWeighted (computed: ScoreBase × CategoryWeight)
├── Severity: Low | Medium | High | Critical
├── Evidences (JSON) // [{ description, url, type }]
├── OwnerPersonId (FK → Person)
├── Status: Open | Mitigated | Accepted | Closed
├── SourceType: Manual | Seed | Review
├── SeedRiskCode (nullable) // collegamento al risk seed del template
├── Notes
└── Implements: BaseEntity, ISoftDelete, IAuditable

MitigationAction
├── Id (Guid)
├── RiskId (FK)
├── Title
├── Description
├── OwnerPersonId (FK → Person)
├── DueDate (DateTime)
├── CompletedAt (DateTime, nullable)
├── Status: Planned | InProgress | Completed | Cancelled
├── Notes
└── Implements: BaseEntity, IAuditable

AuditLogEntry
├── Id (Guid)
├── EntityType (string, es. "Risk", "Assessment", "Mission")
├── EntityId (Guid)
├── Action: Created | Updated | Deleted | StatusChanged
├── PerformedByPersonId (FK → Person)
├── Timestamp (DateTime)
├── PreviousValues (JSON)
├── NewValues (JSON)
├── Diff (JSON) // { field: { old, new } }
├── Notes (nullable)
└── Implements: BaseEntity

DossierSnapshot
├── Id (Guid)
├── AssessmentId (FK)
├── Version (int)
├── Type: PreOfferta | PreGoLive | Review
├── GeneratedByPersonId (FK)
├── GeneratedAt (DateTime)
├── StoragePath (string) // path/URL del PDF
├── Metadata (JSON) // summary stats al momento della generazione
└── Implements: BaseEntity
```

### 2.2 Enums

```csharp
enum RiskSeverity { Low, Medium, High, Critical }
enum RiskStatus { Open, Mitigated, Accepted, Closed }
enum RiskSourceType { Manual, Seed, Review }
enum MitigationStatus { Planned, InProgress, Completed, Cancelled }
enum AuditAction { Created, Updated, Deleted, StatusChanged }
enum DossierType { PreOfferta, PreGoLive, Review }
```

### 2.3 Vincoli e Regole di Business

**Scoring automatico:**
```
ScoreBase = Probability × Impact                    (range: 1-25)
ScoreWeighted = ScoreBase × CategoryWeight           (range: 1-37.5)
```

**Severity (soglie configurabili, default):**
| ScoreWeighted | Severity | Azione automatica |
|---|---|---|
| < 8 | Low | Nessuna |
| 8 – 14 | Medium | Mitigazione obbligatoria |
| 15 – 22 | High | Review TA + mitigazione |
| > 22 | Critical | Escalation CC (Fase 4) |

**Vincoli:**
- Risk.Probability e Impact: range 1-5 (validazione)
- Risk con severity Medium+ deve avere almeno 1 MitigationAction (warning, non bloccante in MVP)
- CategoryWeight è uno **snapshot**: se il peso globale cambia, i risk esistenti mantengono il peso originale
- DossierSnapshot è immutabile una volta generato

---

## 3. Scoring Engine

### 3.1 Servizio

```csharp
public interface IScoringService
{
    RiskSeverity CalculateSeverity(decimal scoreWeighted);
    decimal CalculateWeightedScore(int probability, int impact, decimal categoryWeight);
    SeverityThresholds GetCurrentThresholds();
}
```

### 3.2 Configurazione Soglie

Soglie e pesi salvati in `appsettings.json` (override via DB in futuro):

```json
{
  "RiskScoring": {
    "SeverityThresholds": {
      "Medium": 8,
      "High": 15,
      "Critical": 22
    },
    "DefaultCategoryWeights": {
      "CONTRACT_SLA": 1.5,
      "SCOPE": 1.4,
      "THIRD_PARTY": 1.3,
      "TECHNICAL": 1.2,
      "DELIVERY": 1.1,
      "FINANCIAL": 1.3,
      "SECURITY": 1.5,
      "CLIENT": 1.2
    }
  }
}
```

### 3.3 Ricalcolo

- Al cambio P o I → ricalcolo automatico ScoreBase, ScoreWeighted, Severity
- Il peso categoria NON viene ricalcolato (snapshot)
- L'assessment summary (media, max, distribuzione severity) viene ricalcolato on-read

---

## 4. Audit Log System

### 4.1 Architettura

Estensione dell'`AuditableInterceptor` esistente per produrre `AuditLogEntry` con diff:

```csharp
public class AuditLogInterceptor : SaveChangesInterceptor
{
    // Per ogni entity tracked con stato Modified/Added/Deleted:
    // 1. Cattura OldValues e NewValues
    // 2. Calcola Diff (solo campi effettivamente cambiati)
    // 3. Crea AuditLogEntry
    // 4. Salva nella stessa transaction
}
```

### 4.2 Entity filtrate

Audit log attivo solo per entity di business:
- Mission, Assessment, Risk, MitigationAction, MissionAssignment
- NON per lookup (RiskCategory, OrgRole) e NON per QuestionnaireResponse (troppo verbose)

### 4.3 API

```
GET /api/audit-log?entityType=&entityId=&from=&to=&personId=   [RequireCapability("MISSION_VIEW")]
GET /api/audit-log/entity/{type}/{id}                           [RequireCapability("MISSION_VIEW")]
```

---

## 5. PDF Report — Risk Dossier

### 5.1 Libreria

**QuestPDF** (MIT license, .NET native, fluent API, no dipendenze esterne).

### 5.2 Contenuto Dossier

```
┌─────────────────────────────────────────┐
│ RISK DOSSIER                            │
│ Mission: [Titolo] — v[Versione]         │
│ Data: [timestamp]  Generato da: [nome]  │
├─────────────────────────────────────────┤
│ 1. Executive Summary                    │
│    - Tipo Mission, Cliente, Valore      │
│    - # rischi per severity (grafico)    │
│    - Score medio pesato                 │
│    - Hard conditions triggered (Fase 4) │
├─────────────────────────────────────────┤
│ 2. Team                                 │
│    - BO, TO, PM, Stakeholder            │
├─────────────────────────────────────────┤
│ 3. Questionario (risposte)              │
│    - Sezione per sezione                │
├─────────────────────────────────────────┤
│ 4. Risk Register                        │
│    - Tabella: Categoria, Titolo, P, I,  │
│      Score, Severity, Owner, Status     │
│    - Ordinata per severity desc         │
├─────────────────────────────────────────┤
│ 5. Mitigazioni                          │
│    - Per ogni rischio: azioni, owner,   │
│      scadenza, stato                    │
├─────────────────────────────────────────┤
│ 6. Audit Trail (riassunto)              │
│    - Ultime N azioni significative      │
├─────────────────────────────────────────┤
│ 7. Approval / Escalation               │
│    - Stato assessment, chi ha approvato │
│    - Eventuali note CC                  │
└─────────────────────────────────────────┘
```

### 5.3 API

```
POST   /api/assessments/{id}/dossier/generate    [RequireCapability("DOSSIER_EXPORT")]
       Body: { type: "PreOfferta" | "PreGoLive" | "Review" }
       → genera PDF, salva DossierSnapshot, restituisce URL download

GET    /api/assessments/{id}/dossier              [RequireCapability("MISSION_VIEW")]
       → lista snapshot con metadata

GET    /api/dossier/{snapshotId}/download         [RequireCapability("MISSION_VIEW")]
       → download PDF
```

### 5.4 Storage

MVP: file system locale (`/data/dossiers/{assessmentId}/{version}.pdf`).
Docker: volume montato. Futuro: Azure Blob Storage.

---

## 6. API Endpoints

### 6.1 Risk Categories (admin)

```
GET    /api/risk-categories                      [RequireCapability("MISSION_VIEW")]
POST   /api/risk-categories                      [RequireCapability("CAPABILITY_MANAGE")]
PUT    /api/risk-categories/{id}                 [RequireCapability("CAPABILITY_MANAGE")]
DELETE /api/risk-categories/{id}                 [RequireCapability("CAPABILITY_MANAGE")]
```

### 6.2 Risks

```
GET    /api/assessments/{aId}/risks              [RequireCapability("MISSION_VIEW")]
GET    /api/risks/{id}                           [RequireCapability("MISSION_VIEW")]
POST   /api/assessments/{aId}/risks              [RequireCapability("RISK_CRUD")]
POST   /api/assessments/{aId}/risks/from-seeds   [RequireCapability("RISK_CRUD")]
       → genera rischi dai seed del template (quelli triggered dalle risposte)
PUT    /api/risks/{id}                           [RequireCapability("RISK_CRUD")]
PATCH  /api/risks/{id}/scoring                   [RequireCapability("RISK_CRUD")]
       Body: { probability, impact }
       → ricalcola score + severity
PATCH  /api/risks/{id}/status                    [RequireCapability("RISK_CRUD")]
DELETE /api/risks/{id}                           [RequireCapability("RISK_CRUD")]

POST   /api/risks/{id}/comments                  [RequireCapability("RISK_COMMENT")]
GET    /api/risks/{id}/comments                  [RequireCapability("MISSION_VIEW")]
```

### 6.3 Mitigation Actions

```
GET    /api/risks/{rId}/mitigations              [RequireCapability("MISSION_VIEW")]
POST   /api/risks/{rId}/mitigations              [RequireCapability("RISK_CRUD")]
PUT    /api/mitigations/{id}                     [RequireCapability("RISK_CRUD")]
PATCH  /api/mitigations/{id}/status              [RequireCapability("RISK_CRUD")]
DELETE /api/mitigations/{id}                     [RequireCapability("RISK_CRUD")]
```

---

## 7. Frontend — Pagine e Componenti

### 7.1 Nuove Route

```
/assessments/{id}/risks          → Risk Register (tab nell'assessment)
/risks/{id}                      → Risk detail + mitigazioni
/assessments/{id}/dossier        → Dossier history + genera
/audit-log                       → Audit log viewer (admin)
/admin/risk-categories           → Gestione categorie rischio
```

### 7.2 Risk Register View

- DataGrid con colonne: Categoria (chip colorato), Titolo, P, I, Score, Severity (chip), Owner, Status, # Mitigazioni
- Ordinamento default per ScoreWeighted desc
- Filtri: severity, categoria, status, owner
- **Heat map mini**: matrice 5x5 P×I con pallini colorati per severity
- **Summary bar**: # per severity, score medio, rischi aperti vs chiusi
- Azione inline: modifica P/I con ricalcolo live

### 7.3 Risk Detail

- Info rischio + evidenze (link/attachment list)
- Scoring card: P × I × Peso = Score → Severity (visualizzazione grafica)
- **Mitigazioni**: lista con status, owner, scadenza, azione completamento
- **Commenti**: thread cronologico (TA e altri stakeholder)
- **Audit trail**: timeline delle modifiche a questo rischio

### 7.4 Dossier Management

- Lista snapshot precedenti con version, tipo, data, generato da
- Bottone "Genera Dossier" → dialog con scelta tipo → download PDF
- Preview dossier (opzionale MVP: solo download)

### 7.5 Audit Log Viewer

- DataGrid: Timestamp, Entity, Action, User, campo modificato
- Filtri: entity type, date range, persona
- Espandi riga → dettaglio diff (old → new)

### 7.6 Feature Modules Frontend

```
src/features/risks/
├── api.ts
├── hooks.ts
├── types.ts
└── components/
    ├── RiskRegisterGrid.tsx
    ├── RiskForm.tsx
    ├── RiskScoringCard.tsx
    ├── RiskHeatMap.tsx
    ├── SeverityChip.tsx
    ├── MitigationList.tsx
    ├── MitigationForm.tsx
    └── RiskComments.tsx

src/features/dossier/
├── api.ts
├── hooks.ts
├── types.ts
└── components/
    ├── DossierHistory.tsx
    └── GenerateDossierDialog.tsx

src/features/audit/
├── api.ts
├── hooks.ts
├── types.ts
└── components/
    ├── AuditLogGrid.tsx
    └── AuditDiffViewer.tsx
```

---

## 8. Seed Data

### 8.1 Risk Categories (8 default)

| Code | Name | Default Weight |
|---|---|---|
| CONTRACT_SLA | Contrattuale / SLA / Penali | 1.5 |
| SCOPE | Ambito / Requisiti & Scope | 1.4 |
| THIRD_PARTY | Dipendenze Terze Parti | 1.3 |
| TECHNICAL | Tecnico / Architettura | 1.2 |
| DELIVERY | Delivery / Staffing | 1.1 |
| FINANCIAL | Finanziario / Margine | 1.3 |
| SECURITY | Security / Privacy | 1.5 |
| CLIENT | Cliente / Relazione | 1.2 |

---

## 9. Modifiche al Sistema Esistente

- `IApplicationDbContext` → nuovi DbSet: Risks, RiskCategories, MitigationActions, AuditLogEntries, DossierSnapshots
- `AuditableInterceptor` → estendere con logica AuditLogEntry (o nuovo interceptor dedicato)
- Assessment detail page → aggiungere tab "Risks" e tab "Dossier"
- Nuova dipendenza NuGet: `QuestPDF`
- `appsettings.json` → sezione `RiskScoring`
- Docker volume per storage PDF

---

## 10. Acceptance Criteria

| ID | Criterio | Verifica |
|---|---|---|
| AC-RSK-01 | Score pesato calcolato correttamente: P × I × Peso | Unit test + verifica UI |
| AC-RSK-02 | Severity assegnata automaticamente da soglie configurabili | Cambio P/I → severity aggiornata |
| AC-RSK-03 | Risk seed generati dal template in base alle risposte | Endpoint from-seeds restituisce solo seed triggered |
| AC-RSK-04 | Mitigazione obbligatoria per severity Medium+ (warning) | UI mostra warning, non bloccante |
| AC-RSK-05 | Audit log traccia ogni modifica con diff | Verifica su update Risk: old/new values presenti |
| AC-RSK-06 | PDF Dossier generato con tutti i contenuti | Download e verifica manuale sezioni |
| AC-RSK-07 | Snapshot immutabile | Dossier generato non modificabile, versioning corretto |
| AC-RSK-08 | TA può commentare rischi ma non modificarli | Capability check: RISK_COMMENT vs RISK_CRUD |

---

## 11. Effort Stimato

| Area | Complessita | Note |
|---|---|---|
| Domain entities + EF config | Media | 5 entità, JSON columns, computed fields |
| Scoring engine | Bassa | Logica semplice, ben definita |
| Risk service + API | Media | CRUD + scoring + seed generation |
| Mitigation service | Bassa | CRUD standard |
| Audit log interceptor | Alta | Diff calculation, transaction-safe |
| PDF generation (QuestPDF) | Alta | Layout complesso, grafici, tabelle |
| Risk Register UI | Media-Alta | DataGrid, heat map, inline editing |
| Dossier management UI | Bassa | Lista + dialog + download |
| Audit log viewer | Media | DataGrid + diff viewer |
| Test | Media | Scoring logic, seed generation, audit |
