# PRD – Piattaforma Risk Management (MVP)
*Versione v0.5 – **Organization-first** (censimento persone/ruoli/capability) + assessment + delivery loop*  
*Data: 12 Febbraio 2026*

---

## 0. Perché questa versione
Nelle versioni precedenti il PRD era centrato su Mission/Assessment. In realtà, per il vostro modello (**Orbit + Competence Center + Technical Hub + Command Center**), il tool deve partire dalla **struttura organizzativa** per:
- censire **persone** e **appartenenze** (Competence Center, Orbit, staff);
- definire **ruoli “organizzativi”** e **mansioni “sulle Mission”**;
- applicare permessi **capability-based** e produrre report con stakeholder corretti;
- rendere il sistema utilizzabile subito (prima ancora di creare assessment).

> **Principio guida MVP:** senza “Organization Setup” non esiste Mission governance → quindi l’MVP parte da lì.

---

## 1. Obiettivo del prodotto
Piattaforma interna per standardizzare il **risk assessment** delle Mission (commesse) in consulenza IT:
- Tipi Mission: **T&M**, **Fixed Fee**, **Turn Key**, **Reselling**
- Output: **Risk Dossier** tracciabile (pre-offerta) + **Risk Register vivo** durante delivery
- Governance: il **Business Owner** è accountable, il **Technical Owner** registra anche esiti negativi “storici”, il **Technical Architect** è sempre notificato, il **Command Center** può **bloccare/sbloccare**.

---

## 2. Modello organizzativo (AS-IS) – base dati del tool

### 2.1 Strutture e organi
- **Competence Center** (per dominio tecnologico, es. Analytics, .NET, ecc.)  
  - Responsabile: **Competence Lead**
- **Technical Hub** (organo orizzontale)  
  - Ruoli: **Technical Architect** (leader), **Technical Support** (un TS può essere anche CL)
- **Orbit** (unit di mercato, trasversali per area/e di mercato)  
  - Responsabile: **Business Leader**
- **Organi di staff**
  - **Talent Based** (onboarding/recruiting, raccordo CC ↔ Orbit) – ruolo: **Talent Based Coordinator**
  - **HR** – ruolo: **HR Manager**
  - **Command Center** – **General Manager** + **CEO**

### 2.2 Persone, ruoli e mansioni
Nel tool distinguiamo:
- **Ruoli organizzativi** (stabili): Competence Lead, Business Leader, Technical Architect, Technical Support, Talent Based Coordinator, HR Manager, GM, CEO.
- **Mansioni su Mission** (contestuali e variabili): Business Owner, Technical Owner, Project Manager, stakeholder/consulted.

> Questo evita l’errore “un ruolo = una responsabilità”: nel vostro modello la responsabilità dipende dalla Mission.

---

## 3. Modulo 0 (PREREQUISITO MVP): Organization Setup & Censimento

### 3.1 Scopo
Consentire di censire **prima di tutto**:
1) strutture (Orbit, Competence Center, staff)  
2) persone  
3) ruoli organizzativi  
4) capability/permessi  
5) appartenenze e responsabilità (chi guida cosa)

### 3.2 Entità (MVP)
- **Person**
  - id, nome, cognome, email (univoca), stato (active/inactive), note
- **OrgUnit**
  - id, tipo: `competence_center | orbit | staff_group`
  - nome, descrizione, area mercato/tech domain (opzionale), stato
- **OrgRole**
  - id, nome (es. Technical Architect), descrizione
- **OrgAssignment**
  - personId, orgUnitId, orgRoleId, validFrom, validTo (opz.)
- **Capability**
  - id, codice (es. `MISSION_CREATE`, `ASSESSMENT_APPROVE`, `CC_BLOCK`), descrizione
- **RoleCapability**
  - orgRoleId, capabilityId
- **MissionRole (mansione)**
  - id, codice: `BUSINESS_OWNER | TECHNICAL_OWNER | PROJECT_MANAGER | STAKEHOLDER`
- **MissionAssignment**
  - missionId, personId, missionRoleId, note

### 3.3 Permessi (capability-based)
Esempio capabilità MVP:
- Organization: `ORGUNIT_MANAGE`, `PERSON_MANAGE`, `ROLE_MANAGE`, `CAPABILITY_MANAGE`
- Mission: `MISSION_CREATE`, `MISSION_EDIT`, `MISSION_VIEW`
- Assessment: `ASSESSMENT_CREATE`, `ASSESSMENT_SUBMIT`, `ASSESSMENT_APPROVE`, `ASSESSMENT_REJECT`
- Risk: `RISK_CRUD`, `RISK_COMMENT`
- Report: `DOSSIER_EXPORT`
- Escalation: `ESCALATE_TO_CC`, `CC_VIEW`, `CC_BLOCK`, `CC_UNBLOCK`

**Default di governance (consigliato)**
- Business Leader / Business Owner: create/approve assessment, export dossier
- Technical Architect: view/comment, visibilità trasversale, no approve
- Command Center: block/unblock, view executive summary
- Competence Lead/PM/TO: create/compilare rischi e mitigazioni (in base alle mansioni)

> Le capability sono modificabili dal tool (admin), così non “codifichi” la governance in modo rigido.

### 3.4 Workflow di censimento (bootstrap)
1. **Creazione OrgUnit**
   - Inserisci Orbit (nome, area mercato)
   - Inserisci Competence Center (nome, dominio tecnologico)
   - Inserisci staff group (Talent Based, HR, Command Center, Technical Hub)
2. **Censimento persone**
   - Inserisci persone + email
3. **Assegnazioni**
   - Associa persone a OrgUnit con OrgRole (es. Mario → Technical Hub → Technical Support)
4. **Configurazione permessi**
   - Mappa OrgRole → Capability (default pronto + override)
5. **Primo sanity check**
   - Verifica: esiste almeno 1 Business Leader, 1 Technical Architect, 1 Command Center member

### 3.5 UI minima (MVP)
- **Organization Dashboard**: conteggi (Orbit, CC, persone), alert (ruoli mancanti)
- **OrgUnit list/detail**: crea/modifica Orbit/CC/staff
- **People list/detail**: crea/modifica persona, assegnazioni
- **Roles & Capabilities**: matrice ruolo→capability

### 3.6 Acceptance Criteria (Modulo 0)
- AC-ORG-01: non si può creare una Mission senza almeno un **Orbit** censito.
- AC-ORG-02: email persona univoca; un utente inattivo non è assegnabile a nuove Mission.
- AC-ORG-03: Technical Architect è sempre identificabile come ruolo (almeno 1 persona assegnata).
- AC-ORG-04: Command Center (GM/CEO) deve esistere come gruppo con almeno 1 persona.

---

## 4. Mission (master data nel tool) – dopo il censimento

### 4.1 Entità Mission (MVP)
- id, titolo, Orbit, tipo Mission, cliente, settore, valore stimato, margine atteso, date, link esterni (CRM/ADO), stato

### 4.2 Regole minime
- Mission valida solo se: Orbit, tipo Mission, cliente, valore stimato, **Business Owner** assegnato.
- La Mission può avere più mansioni (BO, TO, PM, stakeholder).

---

## 5. Assessment: scoring pesato + escalation hard

### 5.1 Decisioni chiave
- Scoring: **P×I 1–5** con **pesi per categoria**
- Escalation: su **Critico** e su **hard conditions** configurabili
- Notifiche: in-app + email (no Teams MVP)
- Template: per tipo Mission (T&M / Fixed Fee / Turn Key / Reselling)
- Lifecycle: aggiornabile durante delivery (risk review)

### 5.2 Modello dati concettuale (MVP)
- **Assessment**: missionId, versione, stato (`Draft | InReview | Approved | Rejected | Escalated | Blocked`), createdBy, approvedBy (BO), timestamps
- **QuestionnaireResponse**: assessmentId, sezione, domanda, risposta, allegati/links
- **Risk**: assessmentId, categoria, P, I, pesoCategoria, scorePesato, severità, evidenze, owner, stato
- **MitigationAction**: riskId, owner, dueDate, stato
- **Escalation**: reason (score/hard), decisione CC (block/unblock/notes)
- **AuditLog**: entity, action, user, timestamp, diff

### 5.3 Scoring pesato (default configurabile)
ScoreBase = P×I (1–25)  
**ScorePesato = ScoreBase × PesoCategoria**

Esempio pesi default (configurabili):
| Categoria | Peso |
|---|---|
| Contrattuale / SLA / Penali | 1.5 |
| Ambito / Requisiti & Scope | 1.4 |
| Dipendenze terze parti | 1.3 |
| Tecnico / Architettura | 1.2 |
| Delivery / Staffing | 1.1 |
| Finanziario / Margine | 1.3 |
| Security / Privacy | 1.5 |
| Cliente / Relazione | 1.2 |

Severità (basata su score pesato – soglie configurabili):
| Score pesato | Severità | Azione |
|---|---|---|
| < 8 | Basso | Gestione locale |
| 8–14 | Medio | Mitigazioni obbligatorie |
| 15–22 | Alto | Review TA + mitigazioni |
| > 22 | Critico | Escalation CC (score-based) |

### 5.4 Hard conditions (configurabili)
Regole “hard” (esempi da configurare in MVP):
- Penali presenti OR SLA stringenti **+** tipo Mission in `Fixed Fee` o `Turn Key`
- Cliente nuovo/non qualificato **+** tipo Mission in `Fixed Fee` o `Turn Key` o `Reselling`
- Subcontracting significativo (>= X% effort/costo)
- Dati sensibili **+** assenza misure minime (security review / DPIA)
- Tecnologia nuova **+** dipendenza terze parti critica **+** go-live < X settimane
- Margine atteso < soglia (es. < 15%) per `Fixed Fee` o `Turn Key`

Effetto: stato Assessment → **Escalated** + notifica al **Command Center** + executive summary.

---

## 6. Template per tipo Mission (questionario + rischi seed)
Il MVP include template per:
- **T&M**
- **Fixed Fee**
- **Turn Key**
- **Reselling**

Ogni template definisce:
1) sezioni del questionario  
2) branching (domande condizionate)  
3) rischi seed consigliati  
4) pesi categoria opzionali (override)

---

## 7. Delivery loop: Risk Review periodiche (MVP)
- Creazione di **Risk Review** periodiche collegate alla Mission (settimanale/mensile o ad-hoc)
- Aggiornamento P/I e stato rischi; chiusura rischi mitigati
- Link CR → rischio “scope/requisiti” e aggiornamento score/margine (qualitativo in MVP)
- Versioning dossier: snapshot **pre-offerta** + snapshot **pre-go-live** (se applicabile)

---

## 8. Backlog MVP (organization-first)

### E0 – Organization Setup (must-have)
- US-0.1: Come admin voglio creare OrgUnit (Orbit/Competence Center/Staff).
- US-0.2: Come admin voglio censire persone e assegnarle a OrgUnit con OrgRole.
- US-0.3: Come admin voglio mappare OrgRole → Capability con default modificabili.
- US-0.4: Come sistema voglio impedire creazione Mission senza Orbit e BO.

### E1 – Mission registry & mansioni su Mission
- US-1.1: Come BO voglio creare una Mission da zero con campi minimi obbligatori.
- US-1.2: Come utente voglio assegnare mansioni (BO/TO/PM) e stakeholder alla Mission.

### E2 – Assessment wizard (questionario dinamico)
- US-2.1: Come BO/TO voglio avviare un assessment scegliendo template per tipo Mission.
- US-2.2: Come BO/TO voglio questionario dinamico basato su trigger/risposte.
- US-2.3: Come utente voglio allegare evidenze (SOW, email, link).

### E3 – Risk register & scoring pesato
- US-3.1: Come BO/TO voglio creare rischi o partire da rischi seed.
- US-3.2: Come sistema voglio calcolo automatico score pesato e severità.
- US-3.3: Come TA voglio vedere e commentare i rischi.

### E4 – Mitigazioni, audit e report
- US-4.1: Come BO/TO/PM voglio creare azioni di mitigazione (owner, scadenza, stato).
- US-4.2: Come BO voglio generare Risk Dossier PDF con versioning.
- US-4.3: Come azienda voglio audit log completo.

### E5 – Escalation & Command Center gate
- US-5.1: Come sistema voglio Escalation su score-based o hard conditions.
- US-5.2: Come CC voglio vedere executive summary e decidere block/unblock con note.
- US-5.3: Come BO voglio vedere stato di blocco e motivazioni CC.

### E6 – Delivery risk loop
- US-6.1: Come PM/TO voglio creare Risk Review e aggiornare rischi in delivery.
- US-6.2: Come BO voglio vedere collegamenti CR→rischi e impatto qualitativo sul margine.

---

## 9. KPI MVP (misurabili)
- % Mission “delicate” con Risk Dossier prodotto **prima** dell’offerta
- Tempo medio compilazione assessment (target: sostenibile, non bloccante)
- # escalation CC (score vs hard) e outcome (block/unblock)
- % rischi con mitigazioni assegnate e chiuse entro scadenza
- Riduzione “requisiti non definiti” rilevati post-firma (proxy: # CR early)

---

## 10. Open points (per chiudere sprint planning)
1) Definire **5–7 hard conditions definitive** per MVP.
2) Stabilire se i **pesi categoria** sono globali o differenziati per template.
3) Decidere la cadenza default delle **Risk Review** in delivery (settimanale/mensile/ad-hoc).
