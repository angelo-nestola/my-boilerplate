# Fase 1 — Foundation + Organization Setup (E0)

*Prerequisito per tutto l'MVP. Senza organizzazione censita, nessuna Mission può esistere.*

---

## 1. Obiettivo

Costruire le fondamenta del domain model e il modulo di censimento organizzativo:
- Strutture (Orbit, Competence Center, Staff Group)
- Persone
- Ruoli organizzativi e assegnazioni
- Sistema di autorizzazione capability-based
- UI di gestione completa

---

## 2. Entità Domain

### 2.1 Person
```
Person : BaseEntity, ISoftDelete, IAuditable
├── FirstName         (string, required, max 100)
├── LastName          (string, required, max 100)
├── Email             (string, required, unique, max 256)
├── Status            (enum: Active, Inactive)
├── Notes             (string?, max 2000)
├── UserId            (Guid?, FK → ApplicationUser — nullable, collegamento opzionale all'account di login)
├── OrgAssignments    (ICollection<OrgAssignment>)
└── MissionAssignments (ICollection<MissionAssignment>) — usata da Fase 2
```

> **Nota**: `Person` è separata da `ApplicationUser`. Non tutte le persone censite avranno un account di login (es. stakeholder esterni). Il collegamento è opzionale via `UserId`.

### 2.2 OrgUnit
```
OrgUnit : BaseEntity, ISoftDelete, IAuditable
├── Name              (string, required, max 200)
├── Type              (enum: CompetenceCenter, Orbit, StaffGroup)
├── Description       (string?, max 2000)
├── Domain            (string?, max 200 — dominio tech per CC, area mercato per Orbit)
├── Status            (enum: Active, Inactive)
├── Assignments       (ICollection<OrgAssignment>)
```

### 2.3 OrgRole
```
OrgRole : BaseEntity
├── Name              (string, required, unique, max 100)
├── Code              (string, required, unique, max 50 — es. "TECHNICAL_ARCHITECT")
├── Description       (string?, max 500)
├── IsSystem          (bool, default true — ruoli di sistema non eliminabili)
├── Capabilities      (ICollection<RoleCapability>)
├── Assignments       (ICollection<OrgAssignment>)
```

### 2.4 OrgAssignment
```
OrgAssignment : BaseEntity
├── PersonId          (Guid, FK → Person, required)
├── OrgUnitId         (Guid, FK → OrgUnit, required)
├── OrgRoleId         (Guid, FK → OrgRole, required)
├── ValidFrom         (DateTime, required)
├── ValidTo           (DateTime?, nullable = ancora attivo)
├── Person            (nav)
├── OrgUnit           (nav)
├── OrgRole           (nav)
```
- Unique constraint: (PersonId, OrgUnitId, OrgRoleId, ValidFrom)

### 2.5 Capability
```
Capability : BaseEntity
├── Code              (string, required, unique, max 50 — es. "MISSION_CREATE")
├── Name              (string, required, max 100)
├── Description       (string?, max 500)
├── Group             (string, max 50 — es. "Organization", "Mission", "Assessment", "Risk", "Escalation")
├── IsSystem          (bool, default true)
├── RoleCapabilities  (ICollection<RoleCapability>)
```

### 2.6 RoleCapability
```
RoleCapability : BaseEntity
├── OrgRoleId         (Guid, FK → OrgRole, required)
├── CapabilityId      (Guid, FK → Capability, required)
├── OrgRole           (nav)
├── Capability        (nav)
```
- Unique constraint: (OrgRoleId, CapabilityId)

### 2.7 Enums
```csharp
enum OrgUnitType       { CompetenceCenter, Orbit, StaffGroup }
enum PersonStatus      { Active, Inactive }
enum OrgUnitStatus     { Active, Inactive }
```

---

## 3. Capability-Based Authorization

### 3.1 Capability Seed (default MVP)

| Gruppo | Codice | Descrizione |
|--------|--------|-------------|
| Organization | `ORGUNIT_MANAGE` | Crea/modifica/disattiva OrgUnit |
| Organization | `PERSON_MANAGE` | Crea/modifica persone e assegnazioni |
| Organization | `ROLE_MANAGE` | Gestisce ruoli e capability mapping |
| Organization | `CAPABILITY_MANAGE` | Modifica capability (super-admin) |
| Mission | `MISSION_CREATE` | Crea nuove Mission |
| Mission | `MISSION_EDIT` | Modifica Mission esistenti |
| Mission | `MISSION_VIEW` | Visualizza Mission |
| Assessment | `ASSESSMENT_CREATE` | Avvia nuovo assessment |
| Assessment | `ASSESSMENT_SUBMIT` | Sottomette assessment per review |
| Assessment | `ASSESSMENT_APPROVE` | Approva assessment |
| Assessment | `ASSESSMENT_REJECT` | Rigetta assessment |
| Risk | `RISK_CRUD` | Crea/modifica/elimina rischi |
| Risk | `RISK_COMMENT` | Commenta rischi |
| Report | `DOSSIER_EXPORT` | Esporta Risk Dossier PDF |
| Escalation | `ESCALATE_TO_CC` | Invia escalation al Command Center |
| Escalation | `CC_VIEW` | Visualizza dashboard Command Center |
| Escalation | `CC_BLOCK` | Blocca Mission |
| Escalation | `CC_UNBLOCK` | Sblocca Mission |

### 3.2 Default Role → Capability Mapping

| Ruolo | Capability |
|-------|-----------|
| **CEO / GM** | `CC_VIEW`, `CC_BLOCK`, `CC_UNBLOCK`, `MISSION_VIEW`, `DOSSIER_EXPORT` |
| **Business Leader** | `MISSION_CREATE`, `MISSION_EDIT`, `MISSION_VIEW`, `ASSESSMENT_CREATE`, `ASSESSMENT_APPROVE`, `ASSESSMENT_REJECT`, `DOSSIER_EXPORT`, `ESCALATE_TO_CC` |
| **Technical Architect** | `MISSION_VIEW`, `ASSESSMENT_CREATE`, `RISK_CRUD`, `RISK_COMMENT`, `DOSSIER_EXPORT` |
| **Technical Support** | `MISSION_VIEW`, `RISK_CRUD`, `RISK_COMMENT` |
| **Competence Lead** | `MISSION_VIEW`, `ASSESSMENT_CREATE`, `RISK_CRUD`, `RISK_COMMENT`, `PERSON_MANAGE` |
| **Talent Based Coordinator** | `PERSON_MANAGE`, `MISSION_VIEW` |
| **HR Manager** | `PERSON_MANAGE`, `ORGUNIT_MANAGE`, `MISSION_VIEW` |

### 3.3 Implementazione Tecnica

**Backend — Custom Authorization Handler**
```
[RequireCapability("MISSION_CREATE")]  ← Attribute custom
         ↓
CapabilityAuthorizationHandler:
  1. Estrai UserId dal JWT
  2. Trova Person con UserId
  3. Carica OrgAssignments attive (ValidTo == null || ValidTo > now)
  4. Raccogli OrgRoleId distinti
  5. Carica RoleCapability per quei ruoli
  6. Verifica se la capability richiesta è presente
  7. Autorizza o nega
```

**Caching**: le capability dell'utente vengono risolte una volta per request (scoped service `ICurrentUserCapabilities`). No cache cross-request per MVP — le modifiche ai permessi si riflettono immediatamente.

**Frontend — Capability nel profilo utente**
- `GET /api/auth/me` restituisce anche `capabilities: string[]`
- Hook `useCapability("MISSION_CREATE")` → `boolean`
- Componente `<Can capability="MISSION_CREATE">...</Can>` per conditional rendering

---

## 4. API Endpoints

### 4.1 OrgUnit
```
GET    /api/org-units                    [RequireCapability("MISSION_VIEW")]
GET    /api/org-units/{id}               [RequireCapability("MISSION_VIEW")]
GET    /api/org-units/{id}/members       [RequireCapability("MISSION_VIEW")]
POST   /api/org-units                    [RequireCapability("ORGUNIT_MANAGE")]
PUT    /api/org-units/{id}               [RequireCapability("ORGUNIT_MANAGE")]
DELETE /api/org-units/{id}               [RequireCapability("ORGUNIT_MANAGE")]
```

### 4.2 Person
```
GET    /api/persons                      [RequireCapability("MISSION_VIEW")]
GET    /api/persons/{id}                 [RequireCapability("MISSION_VIEW")]
POST   /api/persons                      [RequireCapability("PERSON_MANAGE")]
PUT    /api/persons/{id}                 [RequireCapability("PERSON_MANAGE")]
DELETE /api/persons/{id}                 [RequireCapability("PERSON_MANAGE")]
```

### 4.3 OrgAssignment
```
GET    /api/persons/{personId}/assignments          [RequireCapability("MISSION_VIEW")]
POST   /api/persons/{personId}/assignments          [RequireCapability("PERSON_MANAGE")]
PUT    /api/persons/{personId}/assignments/{id}     [RequireCapability("PERSON_MANAGE")]
DELETE /api/persons/{personId}/assignments/{id}     [RequireCapability("PERSON_MANAGE")]
```

### 4.4 OrgRole & Capability (Admin)
```
GET    /api/org-roles                               [RequireCapability("MISSION_VIEW")]
GET    /api/org-roles/{id}/capabilities              [RequireCapability("ROLE_MANAGE")]
PUT    /api/org-roles/{id}/capabilities              [RequireCapability("ROLE_MANAGE")]
GET    /api/capabilities                             [RequireCapability("ROLE_MANAGE")]
```

### 4.5 Organization Dashboard
```
GET    /api/organization/dashboard                   [RequireCapability("MISSION_VIEW")]
GET    /api/organization/sanity-check                [RequireCapability("ORGUNIT_MANAGE")]
```

---

## 5. Servizi Application Layer

### 5.1 IOrgUnitService
- `GetAllAsync(type?, status?)` → `Result<List<OrgUnitDto>>`
- `GetByIdAsync(id)` → `Result<OrgUnitDetailDto>`
- `CreateAsync(dto)` → `Result<OrgUnitDto>`
- `UpdateAsync(id, dto)` → `Result<OrgUnitDto>`
- `DeleteAsync(id)` → `Result` (soft delete)
- `GetMembersAsync(id)` → `Result<List<OrgAssignmentDto>>`

### 5.2 IPersonService
- `GetAllAsync(search?, status?)` → `Result<List<PersonListDto>>`
- `GetByIdAsync(id)` → `Result<PersonDetailDto>` (include assegnazioni)
- `CreateAsync(dto)` → `Result<PersonDto>`
- `UpdateAsync(id, dto)` → `Result<PersonDto>`
- `DeleteAsync(id)` → `Result`

### 5.3 IOrgAssignmentService
- `GetByPersonAsync(personId)` → `Result<List<OrgAssignmentDto>>`
- `AssignAsync(dto)` → `Result<OrgAssignmentDto>`
- `UpdateAsync(id, dto)` → `Result<OrgAssignmentDto>`
- `RemoveAsync(id)` → `Result`

### 5.4 ICapabilityService
- `GetAllAsync(group?)` → `Result<List<CapabilityDto>>`
- `GetRoleCapabilitiesAsync(roleId)` → `Result<List<CapabilityDto>>`
- `UpdateRoleCapabilitiesAsync(roleId, capabilityIds)` → `Result`
- `GetUserCapabilitiesAsync(userId)` → `Result<List<string>>`

### 5.5 IOrganizationDashboardService
- `GetDashboardAsync()` → `Result<OrgDashboardDto>`
- `RunSanityCheckAsync()` → `Result<SanityCheckResultDto>`

---

## 6. Validazioni (FluentValidation)

### CreateOrgUnitValidator
- Name: required, max 200
- Type: required, valore enum valido
- Domain: max 200

### CreatePersonValidator
- FirstName: required, max 100
- LastName: required, max 100
- Email: required, valid email, unique (async)
- Status: default Active

### CreateOrgAssignmentValidator
- PersonId: must exist, Person must be Active
- OrgUnitId: must exist, OrgUnit must be Active
- OrgRoleId: must exist
- ValidFrom: required
- No duplicate active assignment (same person + unit + role)

---

## 7. Frontend — Pagine e Componenti

### 7.1 Nuove Route
```
/organization                    → Organization Dashboard
/organization/units              → OrgUnit list
/organization/units/new          → Crea OrgUnit
/organization/units/:id          → Dettaglio OrgUnit + membri
/organization/people             → Person list
/organization/people/new         → Crea Person
/organization/people/:id         → Dettaglio Person + assegnazioni
/organization/roles              → Matrice Ruoli ↔ Capability
```

### 7.2 Organization Dashboard
- **Stat cards**: conteggio Orbit, CC, Staff Group, Persone attive
- **Alert banner**: risultati sanity check (ruoli mancanti, configurazione incompleta)
- **Quick links**: "Aggiungi Orbit", "Censisci Persona", "Configura Ruoli"

### 7.3 OrgUnit Management
- **List**: DataGrid con filtri per tipo e status, search per nome
- **Create/Edit**: form con campi Name, Type, Description, Domain, Status
- **Detail**: info OrgUnit + lista membri con possibilità di aggiungere

### 7.4 People Management
- **List**: DataGrid con search, filtro status, colonna ruoli (chips)
- **Create/Edit**: form persona + sezione assegnazioni
- **Detail**: info persona + lista assegnazioni attive/storiche

### 7.5 Roles & Capabilities Matrix
- **Matrice**: righe = OrgRole, colonne = Capability (raggruppate per Group)
- **Checkbox toggle**: admin può abilitare/disabilitare capability per ruolo
- **Chip gruppi**: filtro per gruppo capability

### 7.6 Feature Module Frontend
```
src/features/organization/
├── api.ts              # API calls
├── hooks.ts            # React Query hooks
├── types.ts            # TypeScript interfaces
└── components/
    ├── OrgUnitForm.tsx
    ├── PersonForm.tsx
    ├── AssignmentDialog.tsx
    ├── CapabilityMatrix.tsx
    ├── SanityCheckAlert.tsx
    └── OrgDashboardStats.tsx
```

---

## 8. Seed Data & Migration

### 8.1 Seed OrgRoles (sistema)
```
BUSINESS_LEADER, COMPETENCE_LEAD, TECHNICAL_ARCHITECT, TECHNICAL_SUPPORT,
TALENT_BASED_COORDINATOR, HR_MANAGER, GENERAL_MANAGER, CEO
```

### 8.2 Seed Capabilities
Tutte le 18 capability elencate in §3.1

### 8.3 Seed RoleCapability
Mapping di default come da §3.2

### 8.4 Migration
- Una migration per creare tutte le tabelle Fase 1
- Un `DbSeeder` service che popola ruoli, capability e mapping al primo avvio

---

## 9. Acceptance Criteria

| ID | Criterio | Verifica |
|----|---------|----------|
| AC-ORG-01 | Non si può creare una Mission senza almeno un Orbit censito | API Mission restituisce errore se 0 Orbit attive |
| AC-ORG-02 | Email persona univoca; persona inattiva non assegnabile a nuove Mission | Validazione unique + check status |
| AC-ORG-03 | Technical Architect identificabile (almeno 1 persona assegnata) | Sanity check + warning dashboard |
| AC-ORG-04 | Command Center deve esistere con almeno 1 persona | Sanity check + warning dashboard |
| AC-ORG-05 | Capability modificabili da admin | UI matrice funzionante |
| AC-ORG-06 | Ruoli di sistema non eliminabili | API rifiuta delete su IsSystem=true |

---

## 10. Impatto sul Boilerplate Esistente

### Da modificare
- `IApplicationDbContext`: aggiungere DbSet per tutte le nuove entità
- `ApplicationDbContext`: registrare entity configurations
- `Program.cs`: registrare nuovi servizi, authorization handler, seeder
- `ICurrentUserService`: estendere per esporre capabilities
- `GET /api/auth/me`: includere capabilities nella response
- **Sidebar menu config**: aggiungere sezione "Organization"

### Da creare
- Tutte le entità domain (§2)
- Entity configurations EF Core
- Servizi application + infrastructure
- `RequireCapabilityAttribute` + `CapabilityAuthorizationHandler`
- FluentValidation validators
- Controller per ogni risorsa
- Migration + Seeder
- Feature module frontend completo

### Da rimuovere/deprecare
- Le entità `Project`, `ProjectMember`, `ProjectTask`, `TaskCategory` del boilerplate non servono. Possono essere rimosse o lasciate inattive.

---

## 11. Delta implementativo (rispetto al perimetro originale)

Questa sezione documenta tutto ciò che è stato implementato in aggiunta o in variazione rispetto al piano iniziale.

### 11.1 OrgUnit — Gerarchia e campo Code

L'entità `OrgUnit` è stata estesa con:

- **`Code`** (string, required, unique, max 50) — codice breve dell'unità (es. `CC`, `ORBYT-1`, `SWE1`)
- **`ParentId`** (Guid?, FK self-referencing) — supporto gerarchia parent/children
- **`Parent`**, **`Children`** — navigation properties
- Configurazione EF: self-referencing FK con `DeleteBehavior.Restrict`

**Enum `OrgUnitType` aggiornato**: aggiunto `TechnicalHub` (organo orizzontale che governa i CC).

```csharp
enum OrgUnitType { CompetenceCenter, Orbit, StaffGroup, TechnicalHub }
```

### 11.2 Struttura organizzativa seedata

Il seeder crea la seguente struttura completa:

```
Command Center (CC) — StaffGroup, root
├── Technical Hub (THUB) — TechnicalHub
│   ├── BCO Enterprise Platforms — CC
│   ├── WEB CMS UI — CC
│   ├── MOB Mobile — CC
│   ├── SWE1 SW Engineer NET — CC
│   ├── SWA1 SW Automation NET — CC
│   ├── SWE2 SW Engineer OPEN — CC
│   ├── SWA2 SW Automation OPEN — CC
│   ├── RTD Real Time Solutions — CC
│   ├── INFRA Infrastructure On Prem — CC
│   ├── CLOUD Cloud Infrastructure — CC
│   ├── DAN Analytics — CC
│   ├── AI AI Engineering — CC
│   └── Assitech — CC
├── Talent Based (TB) — StaffGroup
├── HR — StaffGroup
├── Marketing (MKT) — StaffGroup
├── Administration (ADM) — StaffGroup
├── ORBYT-1 Mobility & Industrial — Orbit
├── ORBYT-2 Financial Services — Orbit
├── ORBYT-3 Fashion, Retail & Entertainment — Orbit
├── ORBYT-4 Energy, Telco, Spaces, PA — Orbit
├── ORBYT-5 SMB — Orbit
├── ORBYT-R&D — Orbit
└── ORBYT-Lab — Orbit
```

### 11.3 Ruoli organizzativi aggiornati

Rispetto al piano originale, i ruoli sono stati ampliati e rinominati:

| Codice | Nome | Note |
|---|---|---|
| CEO | CEO | Invariato |
| GENERAL_MANAGER | General Manager | Invariato |
| **BUSINESS_MANAGER** | Business Manager | **Nuovo** — responsabile di tutti i BL |
| BUSINESS_LEADER | Business Leader | Invariato |
| TECHNICAL_ARCHITECT | Technical Architect | Invariato |
| TECHNICAL_SUPPORT | Technical Support | Invariato |
| COMPETENCE_LEAD | Competence Lead | Invariato |
| **TALENT_LEAD** | Talent Lead | **Rinominato** da TALENT_BASED_COORDINATOR |
| **TALENT_SPECIALIST** | Talent Specialist | **Nuovo** — opera in Talent Based |
| **HR_LEAD** | HR Lead | **Rinominato** da HR_MANAGER |
| **HR_SPECIALIST** | HR Specialist | **Nuovo** — opera in HR |
| **ADMINISTRATION_LEAD** | Administration Lead | **Nuovo** |
| **ADMINISTRATION_SPECIALIST** | Administration Specialist | **Nuovo** |
| **MARKETING_LEAD** | Marketing Lead | **Nuovo** |
| **MARKETING_SPECIALIST** | Marketing Specialist | **Nuovo** |
| PLATFORM_ADMIN | Platform Admin | **Nuovo** — tutte le capability |

### 11.4 API aggiuntive

```
GET /api/org-units/tree    [RequireCapability("MISSION_VIEW")]
```

Restituisce l'albero gerarchico delle OrgUnit (ricorsivo, per l'organigramma).

### 11.5 Pagina Org Chart (split-view)

Aggiunta pagina dedicata `/organization/chart` con:

- **Voce di menu** "Org Chart" con icona nel submenu Organization
- **Layout split-view**: albero collassabile a sinistra (~30%), dettaglio unità a destra (~70%)
- **Albero**: nodi verticali con `[tipo] CODE — Nome`, expand/collapse, tooltip con nome completo + domain
- **Dettaglio**: info unità (nome, tipo, status, domain, parent) + DataGrid membri (nome, ruolo, dal, al)
- **Auto-select**: all'apertura si seleziona automaticamente il nodo root

Componenti:
- `features/organization/OrgChart.tsx` — albero navigabile con `onSelect`/`selectedId`
- `features/organization/OrgUnitDetail.tsx` — pannello dettaglio con DataGrid

### 11.6 Admin seed e credenziali sviluppo

- Utente admin seedato: `admin@riskplatform.com` / `Admin123!` con ruolo PLATFORM_ADMIN (tutte le capability)
- Form login prepopolato in development mode (`process.env.NODE_ENV === 'development'`)

### 11.7 Migrations applicate

1. `AddOrganizationEntities` — tabelle base Phase 1
2. `AddOrgUnitHierarchyAndTechHub` — ParentId + TechnicalHub
3. `AddOrgUnitCode` — campo Code su OrgUnit

### 11.8 Fix tecnici applicati durante lo sviluppo

- **Circular DI**: `CurrentUserService` e `DbSeeder` usano `IServiceProvider` (lazy resolution)
- **DesignTimeDbContextFactory**: per EF migrations senza avviare l'app
- **MUI v7**: `Grid2` → `Grid` in 6 file
- **Hydration error**: `ListItemText` con `slotProps={{ secondary: { component: 'div' } }}`
- **Route group**: `(dashboard)` rinominato in `(app)`
- **Cleanup**: rimosso `react-organizational-chart` (sostituito con componente custom MUI)
