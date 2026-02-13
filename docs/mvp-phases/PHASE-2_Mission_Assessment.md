# Fase 2 — Mission Registry + Assessment Wizard (E1 + E2)

*Dipende da: Fase 1 completata (organizzazione censita, capability-based auth attivo)*

---

## 1. Obiettivo

Abilitare la creazione di Mission (commesse) e il processo di risk assessment tramite questionario dinamico:
- Registrazione Mission con dati minimi obbligatori
- Assegnazione mansioni (Business Owner, Technical Owner, PM, Stakeholder)
- Template questionario per tipo Mission (T&M, Fixed Fee, Turn Key, Reselling)
- Wizard multi-step con branching condizionale
- Lifecycle assessment: Draft → InReview → Approved/Rejected

---

## 2. Entità Domain

### 2.1 Mission
```
Mission : BaseEntity, ISoftDelete, IAuditable
├── Title                (string, required, max 200)
├── OrbitId              (Guid, FK → OrgUnit where Type=Orbit, required)
├── Type                 (enum: TimeAndMaterial, FixedFee, TurnKey, Reselling)
├── ClientName           (string, required, max 200)
├── ClientSector         (string?, max 100)
├── EstimatedValue       (decimal, required, precision 18,2)
├── ExpectedMargin       (decimal?, precision 5,2 — percentuale)
├── StartDate            (DateTime?, planned start)
├── EndDate              (DateTime?, planned end)
├── ExternalLinks        (string?, max 2000 — JSON array di {label, url} per CRM/ADO)
├── Status               (enum: Draft, Active, OnHold, Completed, Cancelled)
├── Notes                (string?, max 4000)
├── Orbit                (nav → OrgUnit)
├── Assignments          (ICollection<MissionAssignment>)
├── Assessments          (ICollection<Assessment>)
```

### 2.2 MissionRole
```
MissionRole : BaseEntity
├── Code                 (string, required, unique, max 50)
├── Name                 (string, required, max 100)
├── Description          (string?, max 500)
├── IsRequired           (bool — es. BusinessOwner è required)
├── MaxAssignees         (int? — null = illimitato, 1 per BO)
```

Seed values:
- `BUSINESS_OWNER` (required, max 1)
- `TECHNICAL_OWNER` (not required, max 1)
- `PROJECT_MANAGER` (not required, max 1)
- `STAKEHOLDER` (not required, unlimited)

### 2.3 MissionAssignment
```
MissionAssignment : BaseEntity
├── MissionId            (Guid, FK → Mission, required)
├── PersonId             (Guid, FK → Person, required)
├── MissionRoleId        (Guid, FK → MissionRole, required)
├── Notes                (string?, max 500)
├── Mission              (nav)
├── Person               (nav)
├── MissionRole          (nav)
```
- Unique constraint: (MissionId, PersonId, MissionRoleId)

### 2.4 AssessmentTemplate
```
AssessmentTemplate : BaseEntity, IAuditable
├── Name                 (string, required, max 200)
├── MissionType          (enum MissionType — a quale tipo si applica)
├── Version              (int, default 1)
├── IsActive             (bool, default true)
├── Schema               (string, required — JSON del questionario, max)
├── RiskSeeds            (string? — JSON dei rischi seed suggeriti)
├── CategoryWeightOverrides (string? — JSON override pesi categoria)
```

> **Schema JSON** definisce sezioni, domande, tipi risposta e branching rules. Struttura:
```json
{
  "sections": [
    {
      "id": "contractual",
      "title": "Aspetti Contrattuali",
      "order": 1,
      "questions": [
        {
          "id": "q_penalties",
          "text": "Sono previste penali contrattuali?",
          "type": "boolean",
          "required": true,
          "helpText": "Includere SLA con penali economiche",
          "triggers": [
            {
              "condition": { "equals": true },
              "action": "show",
              "targetQuestionIds": ["q_penalty_detail", "q_penalty_amount"]
            }
          ]
        },
        {
          "id": "q_penalty_detail",
          "text": "Descrivere le penali previste",
          "type": "text",
          "required": true,
          "hidden": true
        }
      ]
    }
  ]
}
```

Tipi domanda supportati MVP: `boolean`, `text`, `number`, `single_choice`, `multi_choice`, `date`, `file_link`

### 2.5 Assessment
```
Assessment : BaseEntity, ISoftDelete, IAuditable
├── MissionId            (Guid, FK → Mission, required)
├── TemplateId           (Guid, FK → AssessmentTemplate, required)
├── Version              (int, default 1 — per versioning pre-offerta vs delivery)
├── Status               (enum: Draft, InReview, Approved, Rejected, Escalated, Blocked)
├── SubmittedAt          (DateTime?)
├── SubmittedById        (Guid?, FK → Person)
├── ApprovedAt           (DateTime?)
├── ApprovedById         (Guid?, FK → Person)
├── RejectionReason      (string?, max 2000)
├── Mission              (nav)
├── Template             (nav)
├── Responses            (ICollection<QuestionnaireResponse>)
├── Risks                (ICollection<Risk>) — usata da Fase 3
```

### 2.6 QuestionnaireResponse
```
QuestionnaireResponse : BaseEntity
├── AssessmentId         (Guid, FK → Assessment, required)
├── SectionId            (string, required, max 50 — ref a section.id nel template)
├── QuestionId           (string, required, max 50 — ref a question.id nel template)
├── ResponseValue        (string?, max 4000 — valore serializzato)
├── Attachments          (string?, max 4000 — JSON array di {name, url, type})
├── Assessment           (nav)
```
- Unique constraint: (AssessmentId, QuestionId)

### 2.7 Enums
```csharp
enum MissionType         { TimeAndMaterial, FixedFee, TurnKey, Reselling }
enum MissionStatus       { Draft, Active, OnHold, Completed, Cancelled }
enum AssessmentStatus    { Draft, InReview, Approved, Rejected, Escalated, Blocked }
```

---

## 3. Regole di Business

### 3.1 Mission
- **Validazione creazione**: OrbitId (must exist, active), Type, ClientName, EstimatedValue, almeno 1 BusinessOwner assegnato
- AC-ORG-01: non si può creare Mission se 0 Orbit attive nel sistema
- Solo persone con `MISSION_CREATE` capability possono creare
- Il creatore viene suggerito come BusinessOwner (ma può cambiare)
- Una Mission in status `Draft` è modificabile liberamente; in `Active` richiede `MISSION_EDIT`

### 3.2 Assessment
- Solo 1 assessment attivo (non `Rejected`) per Mission alla volta
- BusinessOwner o TechnicalOwner possono creare (serve capability `ASSESSMENT_CREATE` + mansione sulla Mission)
- Il template viene selezionato in base al MissionType (con possibilità di override)
- **Draft**: compilabile, modificabile
- **InReview**: readonly, in attesa di approvazione BO
- **Approved**: readonly, dossier generabile
- **Rejected**: readonly, motivo visibile, si può creare nuovo assessment
- Transizioni permesse:
  - Draft → InReview (submit, richiede `ASSESSMENT_SUBMIT`)
  - InReview → Approved (richiede `ASSESSMENT_APPROVE` + ruolo BO sulla Mission)
  - InReview → Rejected (richiede `ASSESSMENT_REJECT` + ruolo BO sulla Mission)
  - InReview → Escalated (automatico, se score o hard conditions lo richiedono) — gestito in Fase 4
  - Escalated → Blocked / Approved (decisione CC) — gestito in Fase 4

### 3.3 Branching Questionario
- Il frontend engine valuta i `triggers` ad ogni cambio risposta
- Le domande con `hidden: true` sono visibili solo se un trigger le attiva
- Le risposte a domande hidden che tornano nascoste vengono conservate ma escluse dal calcolo

---

## 4. API Endpoints

### 4.1 Mission
```
GET    /api/missions                              [RequireCapability("MISSION_VIEW")]
GET    /api/missions/{id}                         [RequireCapability("MISSION_VIEW")]
POST   /api/missions                              [RequireCapability("MISSION_CREATE")]
PUT    /api/missions/{id}                         [RequireCapability("MISSION_EDIT")]
DELETE /api/missions/{id}                         [RequireCapability("MISSION_EDIT")]
```
Query params per GET list: `search`, `type`, `status`, `orbitId`

### 4.2 Mission Assignments
```
GET    /api/missions/{missionId}/assignments      [RequireCapability("MISSION_VIEW")]
POST   /api/missions/{missionId}/assignments      [RequireCapability("MISSION_EDIT")]
PUT    /api/missions/{missionId}/assignments/{id} [RequireCapability("MISSION_EDIT")]
DELETE /api/missions/{missionId}/assignments/{id} [RequireCapability("MISSION_EDIT")]
```

### 4.3 Assessment Templates (admin/readonly)
```
GET    /api/assessment-templates                  [RequireCapability("MISSION_VIEW")]
GET    /api/assessment-templates/{id}             [RequireCapability("MISSION_VIEW")]
```

### 4.4 Assessment
```
GET    /api/missions/{missionId}/assessments      [RequireCapability("MISSION_VIEW")]
GET    /api/assessments/{id}                      [RequireCapability("MISSION_VIEW")]
POST   /api/missions/{missionId}/assessments      [RequireCapability("ASSESSMENT_CREATE")]
PUT    /api/assessments/{id}                      [RequireCapability("ASSESSMENT_CREATE")]
POST   /api/assessments/{id}/submit               [RequireCapability("ASSESSMENT_SUBMIT")]
POST   /api/assessments/{id}/approve              [RequireCapability("ASSESSMENT_APPROVE")]
POST   /api/assessments/{id}/reject               [RequireCapability("ASSESSMENT_REJECT")]
```

### 4.5 Questionnaire Responses
```
GET    /api/assessments/{assessmentId}/responses          [RequireCapability("MISSION_VIEW")]
PUT    /api/assessments/{assessmentId}/responses          [RequireCapability("ASSESSMENT_CREATE")]
       (bulk upsert — salva tutte le risposte in una volta)
```

---

## 5. Servizi Application Layer

### 5.1 IMissionService
- `GetAllAsync(search?, type?, status?, orbitId?)` → `Result<List<MissionListDto>>`
- `GetByIdAsync(id)` → `Result<MissionDetailDto>` (include assignments)
- `CreateAsync(dto)` → `Result<MissionDto>`
- `UpdateAsync(id, dto)` → `Result<MissionDto>`
- `DeleteAsync(id)` → `Result`

### 5.2 IMissionAssignmentService
- `GetByMissionAsync(missionId)` → `Result<List<MissionAssignmentDto>>`
- `AssignAsync(dto)` → `Result<MissionAssignmentDto>`
- `UpdateAsync(id, dto)` → `Result<MissionAssignmentDto>`
- `RemoveAsync(id)` → `Result`
- `ValidateMissionRoles(missionId)` → `Result<List<string>>` (lista warning)

### 5.3 IAssessmentService
- `GetByMissionAsync(missionId)` → `Result<List<AssessmentListDto>>`
- `GetByIdAsync(id)` → `Result<AssessmentDetailDto>` (include responses)
- `CreateAsync(missionId, templateId)` → `Result<AssessmentDto>`
- `UpdateAsync(id, dto)` → `Result<AssessmentDto>`
- `SubmitAsync(id)` → `Result` (Draft → InReview)
- `ApproveAsync(id)` → `Result` (InReview → Approved)
- `RejectAsync(id, reason)` → `Result` (InReview → Rejected)

### 5.4 IQuestionnaireService
- `GetResponsesAsync(assessmentId)` → `Result<List<QuestionnaireResponseDto>>`
- `SaveResponsesAsync(assessmentId, responses)` → `Result` (bulk upsert)
- `GetTemplateSchemaAsync(templateId)` → `Result<TemplateSchemaDto>`

---

## 6. Validazioni

### CreateMissionValidator
- Title: required, max 200
- OrbitId: must exist, must be OrgUnit with Type=Orbit and Active
- Type: required, valid enum
- ClientName: required, max 200
- EstimatedValue: > 0
- ExpectedMargin: 0-100 se presente
- StartDate < EndDate se entrambe presenti
- System check: almeno 1 Orbit attiva nel sistema (AC-ORG-01)

### CreateMissionAssignmentValidator
- PersonId: must exist, Active
- MissionRoleId: must exist
- No duplicate (same person + role sulla stessa Mission)
- Se role è BUSINESS_OWNER e MaxAssignees=1, non deve esistere già un altro BO

### SubmitAssessmentValidator
- Assessment must be in Draft
- Tutte le domande `required` (non hidden) devono avere risposta
- Almeno 1 BusinessOwner assegnato alla Mission

---

## 7. Template Questionario — Seed Data

### 7.1 Template per tipo Mission

Vengono creati 4 template seed, uno per tipo. Sezioni comuni:

| Sezione | Domande chiave |
|---------|---------------|
| **Contrattuale / SLA** | Penali? SLA stringenti? Tipo contratto? Clausole particolari? |
| **Ambito / Requisiti** | Requisiti definiti? Documentazione disponibile? Change management? |
| **Tecnico / Architettura** | Stack noto? Tecnologie nuove? Integrazioni? |
| **Delivery / Staffing** | Team allocato? Competenze disponibili? Timeline realistica? |
| **Dipendenze terze parti** | Subcontracting? Vendor lock-in? SLA fornitori? |
| **Finanziario / Margine** | Margine calcolato? Buffer previsto? Costi nascosti? |
| **Security / Privacy** | Dati sensibili? DPIA necessaria? Compliance? |
| **Cliente / Relazione** | Cliente noto? Track record? Decision maker identificato? |

Differenze per tipo:
- **T&M**: sezione contrattuale semplificata, focus su staffing
- **Fixed Fee**: sezione contrattuale estesa, focus su scope/margine
- **Turn Key**: tutte le sezioni al massimo dettaglio
- **Reselling**: focus su fornitori, margine, SLA cliente vs SLA vendor

### 7.2 Risk Seeds per Template
Ogni template include rischi "suggeriti" che vengono pre-popolati nel Risk Register (Fase 3). Esempio per Fixed Fee:
```json
[
  { "category": "Contrattuale", "title": "Penali per ritardo delivery", "defaultP": 3, "defaultI": 4 },
  { "category": "Ambito", "title": "Scope creep non gestito", "defaultP": 4, "defaultI": 4 },
  { "category": "Finanziario", "title": "Margine eroso da effort non previsto", "defaultP": 3, "defaultI": 5 }
]
```

---

## 8. Frontend — Pagine e Componenti

### 8.1 Nuove Route
```
/missions                        → Mission list
/missions/new                    → Crea Mission (form + assignment)
/missions/:id                    → Mission detail (info + assignments + assessments)
/missions/:id/assessments/new    → Avvia assessment (scelta template)
/assessments/:id                 → Assessment wizard (compilazione)
/assessments/:id/review          → Review assessment (readonly + approve/reject)
```

### 8.2 Mission List
- DataGrid con colonne: Title, Client, Type (chip), Orbit, Value, Status, BO name
- Filtri: search, type, status, orbit
- Azioni: Nuovo, Dettaglio, Elimina

### 8.3 Mission Detail
- **Header**: titolo, client, type badge, status badge
- **Info card**: valore, margine, date, link esterni
- **Tab Assignments**: lista mansioni con PersonName + Role, bottone "Assegna"
- **Tab Assessments**: lista assessment con status, versione, date, azioni
- **AssignmentDialog**: modale per assegnare persona con autocomplete + ruolo

### 8.4 Assessment Wizard
- **Stepper orizzontale**: una step per sezione del template
- **Rendering dinamico**: ogni domanda renderizzata in base al `type`
- **Branching engine**: `useQuestionnaireEngine(schema, responses)` — hook che gestisce visibilità domande
- **Auto-save**: debounced save ogni 5 secondi o su cambio sezione
- **Progress indicator**: domande compilate / totale visibili
- **Submit button**: disponibile solo quando tutte le required sono compilate

### 8.5 Assessment Review
- Stessa UI del wizard ma in modalità readonly
- Banner in alto con azioni: Approve / Reject (con modale per motivo)
- Visibile a chi ha `ASSESSMENT_APPROVE`

### 8.6 Feature Modules Frontend
```
src/features/missions/
├── api.ts, hooks.ts, types.ts
└── components/
    ├── MissionForm.tsx
    ├── MissionDetail.tsx
    ├── AssignmentDialog.tsx
    └── MissionStatusBadge.tsx

src/features/assessments/
├── api.ts, hooks.ts, types.ts
└── components/
    ├── AssessmentWizard.tsx
    ├── QuestionRenderer.tsx       # Renderizza singola domanda per tipo
    ├── useQuestionnaireEngine.ts  # Hook branching logic
    ├── AssessmentReview.tsx
    └── AssessmentStatusBadge.tsx
```

---

## 9. Migration & Seed

- Migration con tutte le tabelle Fase 2
- Seed MissionRoles (4 ruoli)
- Seed AssessmentTemplates (4 template, uno per tipo Mission, con schema JSON)
- Seed Risk Seeds embedded nei template

---

## 10. Acceptance Criteria

| ID | Criterio | Verifica |
|----|---------|----------|
| AC-M-01 | Mission richiede Orbit, tipo, cliente, valore, BO | Validazione API |
| AC-M-02 | Non si crea Mission senza Orbit attive (AC-ORG-01) | Check in validator |
| AC-M-03 | Persona inattiva non assegnabile a Mission | Validazione assignment |
| AC-M-04 | Max 1 Business Owner per Mission | Validazione MaxAssignees |
| AC-A-01 | Solo 1 assessment attivo per Mission | Check in create |
| AC-A-02 | Questionario dinamico con branching funzionante | UI test manuale |
| AC-A-03 | Submit possibile solo con tutte le required compilate | Validazione API + UI |
| AC-A-04 | Approve/Reject solo da chi ha capability + ruolo BO | Authorization check |
| AC-A-05 | Assessment rejected permette creazione nuovo | Status check |
