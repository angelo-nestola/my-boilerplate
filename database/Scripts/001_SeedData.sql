-- ============================================
-- CleanApi Seed Data Script - HIGH VOLUME
-- ============================================
-- Eseguire dopo aver registrato almeno un utente via UI
-- ============================================

USE [CleanApi]
GO

SET NOCOUNT ON

-- Variabile per l'utente principale
DECLARE @MainUserId NVARCHAR(450)
SELECT TOP 1 @MainUserId = Id FROM AspNetUsers ORDER BY Id

IF @MainUserId IS NULL
BEGIN
    RAISERROR('Nessun utente trovato. Registra almeno un utente prima di eseguire questo script.', 16, 1)
    RETURN
END

PRINT 'Utente principale: ' + @MainUserId

-- ============================================
-- 1. TASK CATEGORIES (20 categorie)
-- ============================================
PRINT 'Creazione 20 categorie...'

-- Categorie principali (8)
DECLARE @CatBugId UNIQUEIDENTIFIER = NEWID()
DECLARE @CatFeatureId UNIQUEIDENTIFIER = NEWID()
DECLARE @CatImprovementId UNIQUEIDENTIFIER = NEWID()
DECLARE @CatDocId UNIQUEIDENTIFIER = NEWID()
DECLARE @CatTestId UNIQUEIDENTIFIER = NEWID()
DECLARE @CatRefactorId UNIQUEIDENTIFIER = NEWID()
DECLARE @CatSecurityId UNIQUEIDENTIFIER = NEWID()
DECLARE @CatDevOpsId UNIQUEIDENTIFIER = NEWID()

INSERT INTO TaskCategories (Id, Name, Description, Color, Icon, SortOrder, ParentId, IsDeleted, DeletedAt, CreatedBy, UpdatedBy, CreatedAt, UpdatedAt)
VALUES
    (@CatBugId, 'Bug', 'Difetti e problemi da correggere', '#F44336', 'BugReport', 1, NULL, 0, NULL, @MainUserId, NULL, GETUTCDATE(), NULL),
    (@CatFeatureId, 'Feature', 'Nuove funzionalità', '#4CAF50', 'NewReleases', 2, NULL, 0, NULL, @MainUserId, NULL, GETUTCDATE(), NULL),
    (@CatImprovementId, 'Improvement', 'Miglioramenti esistenti', '#2196F3', 'TrendingUp', 3, NULL, 0, NULL, @MainUserId, NULL, GETUTCDATE(), NULL),
    (@CatDocId, 'Documentation', 'Documentazione', '#9C27B0', 'Description', 4, NULL, 0, NULL, @MainUserId, NULL, GETUTCDATE(), NULL),
    (@CatTestId, 'Testing', 'Test e QA', '#FF9800', 'Science', 5, NULL, 0, NULL, @MainUserId, NULL, GETUTCDATE(), NULL),
    (@CatRefactorId, 'Refactoring', 'Pulizia e riorganizzazione codice', '#607D8B', 'Code', 6, NULL, 0, NULL, @MainUserId, NULL, GETUTCDATE(), NULL),
    (@CatSecurityId, 'Security', 'Sicurezza e vulnerabilità', '#E91E63', 'Security', 7, NULL, 0, NULL, @MainUserId, NULL, GETUTCDATE(), NULL),
    (@CatDevOpsId, 'DevOps', 'CI/CD e infrastruttura', '#00BCD4', 'Cloud', 8, NULL, 0, NULL, @MainUserId, NULL, GETUTCDATE(), NULL)

-- Sotto-categorie Bug (4)
INSERT INTO TaskCategories (Id, Name, Description, Color, Icon, SortOrder, ParentId, IsDeleted, DeletedAt, CreatedBy, UpdatedBy, CreatedAt, UpdatedAt)
VALUES
    (NEWID(), 'UI Bug', 'Bug interfaccia', '#E57373', 'DesktopWindows', 1, @CatBugId, 0, NULL, @MainUserId, NULL, GETUTCDATE(), NULL),
    (NEWID(), 'API Bug', 'Bug backend API', '#EF5350', 'Api', 2, @CatBugId, 0, NULL, @MainUserId, NULL, GETUTCDATE(), NULL),
    (NEWID(), 'Database Bug', 'Problemi database', '#F44336', 'Storage', 3, @CatBugId, 0, NULL, @MainUserId, NULL, GETUTCDATE(), NULL),
    (NEWID(), 'Performance Bug', 'Problemi prestazioni', '#D32F2F', 'Speed', 4, @CatBugId, 0, NULL, @MainUserId, NULL, GETUTCDATE(), NULL)

-- Sotto-categorie Feature (4)
INSERT INTO TaskCategories (Id, Name, Description, Color, Icon, SortOrder, ParentId, IsDeleted, DeletedAt, CreatedBy, UpdatedBy, CreatedAt, UpdatedAt)
VALUES
    (NEWID(), 'Frontend Feature', 'Funzionalità UI', '#81C784', 'Web', 1, @CatFeatureId, 0, NULL, @MainUserId, NULL, GETUTCDATE(), NULL),
    (NEWID(), 'Backend Feature', 'Funzionalità API', '#66BB6A', 'Dns', 2, @CatFeatureId, 0, NULL, @MainUserId, NULL, GETUTCDATE(), NULL),
    (NEWID(), 'Integration', 'Integrazioni esterne', '#4CAF50', 'Extension', 3, @CatFeatureId, 0, NULL, @MainUserId, NULL, GETUTCDATE(), NULL),
    (NEWID(), 'Mobile Feature', 'Funzionalità mobile', '#43A047', 'PhoneAndroid', 4, @CatFeatureId, 0, NULL, @MainUserId, NULL, GETUTCDATE(), NULL)

-- Sotto-categorie DevOps (4)
INSERT INTO TaskCategories (Id, Name, Description, Color, Icon, SortOrder, ParentId, IsDeleted, DeletedAt, CreatedBy, UpdatedBy, CreatedAt, UpdatedAt)
VALUES
    (NEWID(), 'CI/CD', 'Pipeline automazione', '#26C6DA', 'PlayCircle', 1, @CatDevOpsId, 0, NULL, @MainUserId, NULL, GETUTCDATE(), NULL),
    (NEWID(), 'Infrastructure', 'Server e cloud', '#00ACC1', 'Dns', 2, @CatDevOpsId, 0, NULL, @MainUserId, NULL, GETUTCDATE(), NULL),
    (NEWID(), 'Monitoring', 'Logging e alerting', '#0097A7', 'Visibility', 3, @CatDevOpsId, 0, NULL, @MainUserId, NULL, GETUTCDATE(), NULL),
    (NEWID(), 'Containerization', 'Docker e Kubernetes', '#00838F', 'ViewInAr', 4, @CatDevOpsId, 0, NULL, @MainUserId, NULL, GETUTCDATE(), NULL)

PRINT 'Categorie create: 20'

-- ============================================
-- 2. PROJECTS (8 progetti)
-- ============================================
PRINT 'Creazione 8 progetti...'

DECLARE @Proj1 UNIQUEIDENTIFIER = NEWID()
DECLARE @Proj2 UNIQUEIDENTIFIER = NEWID()
DECLARE @Proj3 UNIQUEIDENTIFIER = NEWID()
DECLARE @Proj4 UNIQUEIDENTIFIER = NEWID()
DECLARE @Proj5 UNIQUEIDENTIFIER = NEWID()
DECLARE @Proj6 UNIQUEIDENTIFIER = NEWID()
DECLARE @Proj7 UNIQUEIDENTIFIER = NEWID()
DECLARE @Proj8 UNIQUEIDENTIFIER = NEWID()

INSERT INTO Projects (Id, Name, Code, Description, StartDate, EndDate, IsActive, IsDeleted, DeletedAt, CreatedBy, UpdatedBy, CreatedAt, UpdatedAt)
VALUES
    (@Proj1, 'CleanApi Platform', 'CLEAN', 'Piattaforma principale con dashboard gestione progetti, autenticazione JWT e task management.', DATEADD(MONTH, -3, GETUTCDATE()), DATEADD(MONTH, 3, GETUTCDATE()), 1, 0, NULL, @MainUserId, NULL, GETUTCDATE(), NULL),
    (@Proj2, 'Mobile Companion App', 'MOBILE', 'App React Native per iOS/Android con sync offline e push notifications.', DATEADD(MONTH, -2, GETUTCDATE()), DATEADD(MONTH, 4, GETUTCDATE()), 1, 0, NULL, @MainUserId, NULL, GETUTCDATE(), NULL),
    (@Proj3, 'E-Commerce Integration', 'ECOM', 'Hub integrazione Shopify, WooCommerce, Magento per gestione ordini centralizzata.', DATEADD(MONTH, -1, GETUTCDATE()), DATEADD(MONTH, 6, GETUTCDATE()), 1, 0, NULL, @MainUserId, NULL, GETUTCDATE(), NULL),
    (@Proj4, 'Analytics Dashboard', 'ANALYTICS', 'Dashboard business intelligence con grafici real-time e export report.', DATEADD(WEEK, -3, GETUTCDATE()), DATEADD(MONTH, 5, GETUTCDATE()), 1, 0, NULL, @MainUserId, NULL, GETUTCDATE(), NULL),
    (@Proj5, 'Customer Portal', 'PORTAL', 'Portale self-service clienti per ticket support e knowledge base.', DATEADD(WEEK, -2, GETUTCDATE()), DATEADD(MONTH, 4, GETUTCDATE()), 1, 0, NULL, @MainUserId, NULL, GETUTCDATE(), NULL),
    (@Proj6, 'API Gateway', 'GATEWAY', 'Gateway centralizzato per rate limiting, caching e API versioning.', DATEADD(WEEK, -1, GETUTCDATE()), NULL, 1, 0, NULL, @MainUserId, NULL, GETUTCDATE(), NULL),
    (@Proj7, 'Legacy Migration', 'LEGACY', 'Migrazione sistema legacy PHP a .NET Core microservices.', DATEADD(MONTH, -6, GETUTCDATE()), DATEADD(MONTH, -1, GETUTCDATE()), 0, 0, NULL, @MainUserId, NULL, GETUTCDATE(), NULL), -- Inattivo (completato)
    (@Proj8, 'Internal Tools', 'TOOLS', 'Strumenti interni: CLI utilities, script automazione, dev tools.', DATEADD(MONTH, -4, GETUTCDATE()), NULL, 1, 0, NULL, @MainUserId, NULL, GETUTCDATE(), NULL)

PRINT 'Progetti creati: 8'

-- ============================================
-- 3. PROJECT MEMBERS
-- ============================================
PRINT 'Aggiunta membri progetti...'

INSERT INTO ProjectMembers (Id, ProjectId, UserId, Role, JoinedAt, IsActive, CreatedAt, UpdatedAt)
VALUES
    (NEWID(), @Proj1, @MainUserId, 3, DATEADD(MONTH, -3, GETUTCDATE()), 1, GETUTCDATE(), NULL),
    (NEWID(), @Proj2, @MainUserId, 3, DATEADD(MONTH, -2, GETUTCDATE()), 1, GETUTCDATE(), NULL),
    (NEWID(), @Proj3, @MainUserId, 3, DATEADD(MONTH, -1, GETUTCDATE()), 1, GETUTCDATE(), NULL),
    (NEWID(), @Proj4, @MainUserId, 3, DATEADD(WEEK, -3, GETUTCDATE()), 1, GETUTCDATE(), NULL),
    (NEWID(), @Proj5, @MainUserId, 3, DATEADD(WEEK, -2, GETUTCDATE()), 1, GETUTCDATE(), NULL),
    (NEWID(), @Proj6, @MainUserId, 3, DATEADD(WEEK, -1, GETUTCDATE()), 1, GETUTCDATE(), NULL),
    (NEWID(), @Proj7, @MainUserId, 3, DATEADD(MONTH, -6, GETUTCDATE()), 1, GETUTCDATE(), NULL),
    (NEWID(), @Proj8, @MainUserId, 3, DATEADD(MONTH, -4, GETUTCDATE()), 1, GETUTCDATE(), NULL)

PRINT 'Membri aggiunti: 8'

-- ============================================
-- 4. TASKS - Generazione massiva (100+ task)
-- ============================================
PRINT 'Generazione task massiva...'

-- Recupera ID categorie per assegnazione
DECLARE @Categories TABLE (Id UNIQUEIDENTIFIER, Name NVARCHAR(100))
INSERT INTO @Categories SELECT Id, Name FROM TaskCategories

DECLARE @CatCount INT = (SELECT COUNT(*) FROM @Categories)

-- Task per CLEAN (25 task)
DECLARE @i INT = 1
WHILE @i <= 25
BEGIN
    INSERT INTO ProjectTasks (Id, ProjectId, TaskNumber, Title, Description, Status, Priority, CategoryId, AssigneeId, ReporterId, EstimatedHours, ActualHours, DueDate, StartedAt, CompletedAt, IsDeleted, DeletedAt, CreatedBy, UpdatedBy, CreatedAt, UpdatedAt)
    SELECT
        NEWID(),
        @Proj1,
        @i,
        CASE (@i % 10)
            WHEN 0 THEN 'Implementare autenticazione OAuth2 con ' + CAST(@i AS NVARCHAR)
            WHEN 1 THEN 'Fix bug validazione form login #' + CAST(@i AS NVARCHAR)
            WHEN 2 THEN 'Aggiungere unit test per AuthService #' + CAST(@i AS NVARCHAR)
            WHEN 3 THEN 'Ottimizzare query dashboard performance #' + CAST(@i AS NVARCHAR)
            WHEN 4 THEN 'Implementare export CSV per report #' + CAST(@i AS NVARCHAR)
            WHEN 5 THEN 'Refactor componente DataGrid #' + CAST(@i AS NVARCHAR)
            WHEN 6 THEN 'Documentare API endpoint users #' + CAST(@i AS NVARCHAR)
            WHEN 7 THEN 'Setup monitoring con Application Insights #' + CAST(@i AS NVARCHAR)
            WHEN 8 THEN 'Implementare rate limiting API #' + CAST(@i AS NVARCHAR)
            ELSE 'Migliorare UX sidebar navigation #' + CAST(@i AS NVARCHAR)
        END,
        'Descrizione dettagliata del task numero ' + CAST(@i AS NVARCHAR) + '. Questo task richiede attenzione e deve essere completato secondo le specifiche.',
        CASE
            WHEN @i <= 8 THEN 4  -- Done
            WHEN @i <= 12 THEN 3  -- Review
            WHEN @i <= 16 THEN 2  -- InProgress
            WHEN @i <= 20 THEN 1  -- Todo
            ELSE 0  -- Backlog
        END,
        @i % 4,  -- Priority 0-3
        (SELECT TOP 1 Id FROM @Categories ORDER BY NEWID()),
        CASE WHEN @i <= 20 THEN @MainUserId ELSE NULL END,
        @MainUserId,
        (@i % 5 + 1) * 8,
        CASE WHEN @i <= 12 THEN (@i % 5 + 1) * 6 ELSE NULL END,
        CASE WHEN @i <= 20 THEN DATEADD(DAY, @i - 10, GETUTCDATE()) ELSE NULL END,
        CASE WHEN @i <= 16 THEN DATEADD(DAY, -@i, GETUTCDATE()) ELSE NULL END,
        CASE WHEN @i <= 8 THEN DATEADD(DAY, -@i + 5, GETUTCDATE()) ELSE NULL END,
        0, NULL, @MainUserId, NULL,
        DATEADD(DAY, -30 + @i, GETUTCDATE()), NULL
    SET @i = @i + 1
END

-- Task per MOBILE (20 task)
SET @i = 1
WHILE @i <= 20
BEGIN
    INSERT INTO ProjectTasks (Id, ProjectId, TaskNumber, Title, Description, Status, Priority, CategoryId, AssigneeId, ReporterId, EstimatedHours, ActualHours, DueDate, StartedAt, CompletedAt, IsDeleted, DeletedAt, CreatedBy, UpdatedBy, CreatedAt, UpdatedAt)
    SELECT
        NEWID(),
        @Proj2,
        @i,
        CASE (@i % 8)
            WHEN 0 THEN 'Setup navigation stack React Native #' + CAST(@i AS NVARCHAR)
            WHEN 1 THEN 'Implementare offline storage con AsyncStorage #' + CAST(@i AS NVARCHAR)
            WHEN 2 THEN 'Fix crash su iOS 17 #' + CAST(@i AS NVARCHAR)
            WHEN 3 THEN 'Aggiungere biometric authentication #' + CAST(@i AS NVARCHAR)
            WHEN 4 THEN 'Ottimizzare rendering lista task #' + CAST(@i AS NVARCHAR)
            WHEN 5 THEN 'Implementare deep linking #' + CAST(@i AS NVARCHAR)
            WHEN 6 THEN 'Setup push notifications FCM #' + CAST(@i AS NVARCHAR)
            ELSE 'Test E2E con Detox #' + CAST(@i AS NVARCHAR)
        END,
        'Task mobile app: ' + CAST(@i AS NVARCHAR) + '. Sviluppo feature per applicazione companion.',
        CASE
            WHEN @i <= 6 THEN 4
            WHEN @i <= 9 THEN 3
            WHEN @i <= 12 THEN 2
            WHEN @i <= 16 THEN 1
            ELSE 0
        END,
        @i % 4,
        (SELECT TOP 1 Id FROM @Categories ORDER BY NEWID()),
        CASE WHEN @i <= 16 THEN @MainUserId ELSE NULL END,
        @MainUserId,
        (@i % 4 + 1) * 8,
        CASE WHEN @i <= 9 THEN (@i % 4 + 1) * 6 ELSE NULL END,
        CASE WHEN @i <= 16 THEN DATEADD(DAY, @i - 5, GETUTCDATE()) ELSE NULL END,
        CASE WHEN @i <= 12 THEN DATEADD(DAY, -@i, GETUTCDATE()) ELSE NULL END,
        CASE WHEN @i <= 6 THEN DATEADD(DAY, -@i + 3, GETUTCDATE()) ELSE NULL END,
        0, NULL, @MainUserId, NULL,
        DATEADD(DAY, -25 + @i, GETUTCDATE()), NULL
    SET @i = @i + 1
END

-- Task per ECOM (18 task)
SET @i = 1
WHILE @i <= 18
BEGIN
    INSERT INTO ProjectTasks (Id, ProjectId, TaskNumber, Title, Description, Status, Priority, CategoryId, AssigneeId, ReporterId, EstimatedHours, ActualHours, DueDate, StartedAt, CompletedAt, IsDeleted, DeletedAt, CreatedBy, UpdatedBy, CreatedAt, UpdatedAt)
    SELECT
        NEWID(),
        @Proj3,
        @i,
        CASE (@i % 6)
            WHEN 0 THEN 'Connector Shopify: sync prodotti #' + CAST(@i AS NVARCHAR)
            WHEN 1 THEN 'Connector WooCommerce: webhook ordini #' + CAST(@i AS NVARCHAR)
            WHEN 2 THEN 'Dashboard ordini aggregati #' + CAST(@i AS NVARCHAR)
            WHEN 3 THEN 'Gestione inventario multi-warehouse #' + CAST(@i AS NVARCHAR)
            WHEN 4 THEN 'Report vendite per canale #' + CAST(@i AS NVARCHAR)
            ELSE 'Sync automatico prezzi #' + CAST(@i AS NVARCHAR)
        END,
        'Integrazione e-commerce task ' + CAST(@i AS NVARCHAR),
        CASE
            WHEN @i <= 4 THEN 4
            WHEN @i <= 7 THEN 3
            WHEN @i <= 10 THEN 2
            WHEN @i <= 14 THEN 1
            ELSE 0
        END,
        @i % 4,
        (SELECT TOP 1 Id FROM @Categories ORDER BY NEWID()),
        CASE WHEN @i <= 14 THEN @MainUserId ELSE NULL END,
        @MainUserId,
        (@i % 6 + 2) * 8,
        CASE WHEN @i <= 7 THEN (@i % 6 + 1) * 6 ELSE NULL END,
        CASE WHEN @i <= 14 THEN DATEADD(DAY, @i, GETUTCDATE()) ELSE NULL END,
        CASE WHEN @i <= 10 THEN DATEADD(DAY, -@i, GETUTCDATE()) ELSE NULL END,
        CASE WHEN @i <= 4 THEN DATEADD(DAY, -@i + 2, GETUTCDATE()) ELSE NULL END,
        0, NULL, @MainUserId, NULL,
        DATEADD(DAY, -20 + @i, GETUTCDATE()), NULL
    SET @i = @i + 1
END

-- Task per ANALYTICS (15 task)
SET @i = 1
WHILE @i <= 15
BEGIN
    INSERT INTO ProjectTasks (Id, ProjectId, TaskNumber, Title, Description, Status, Priority, CategoryId, AssigneeId, ReporterId, EstimatedHours, ActualHours, DueDate, StartedAt, CompletedAt, IsDeleted, DeletedAt, CreatedBy, UpdatedBy, CreatedAt, UpdatedAt)
    SELECT
        NEWID(),
        @Proj4,
        @i,
        CASE (@i % 5)
            WHEN 0 THEN 'Grafico revenue time-series #' + CAST(@i AS NVARCHAR)
            WHEN 1 THEN 'KPI cards real-time update #' + CAST(@i AS NVARCHAR)
            WHEN 2 THEN 'Export PDF report mensile #' + CAST(@i AS NVARCHAR)
            WHEN 3 THEN 'Drill-down per categoria #' + CAST(@i AS NVARCHAR)
            ELSE 'Filtri data range avanzati #' + CAST(@i AS NVARCHAR)
        END,
        'Analytics dashboard feature ' + CAST(@i AS NVARCHAR),
        CASE
            WHEN @i <= 3 THEN 4
            WHEN @i <= 5 THEN 3
            WHEN @i <= 8 THEN 2
            WHEN @i <= 12 THEN 1
            ELSE 0
        END,
        @i % 4,
        (SELECT TOP 1 Id FROM @Categories ORDER BY NEWID()),
        CASE WHEN @i <= 12 THEN @MainUserId ELSE NULL END,
        @MainUserId,
        (@i % 3 + 1) * 8,
        CASE WHEN @i <= 5 THEN (@i % 3 + 1) * 5 ELSE NULL END,
        CASE WHEN @i <= 12 THEN DATEADD(DAY, @i + 5, GETUTCDATE()) ELSE NULL END,
        CASE WHEN @i <= 8 THEN DATEADD(DAY, -@i, GETUTCDATE()) ELSE NULL END,
        CASE WHEN @i <= 3 THEN DATEADD(DAY, -@i + 1, GETUTCDATE()) ELSE NULL END,
        0, NULL, @MainUserId, NULL,
        DATEADD(DAY, -15 + @i, GETUTCDATE()), NULL
    SET @i = @i + 1
END

-- Task per PORTAL (12 task)
SET @i = 1
WHILE @i <= 12
BEGIN
    INSERT INTO ProjectTasks (Id, ProjectId, TaskNumber, Title, Description, Status, Priority, CategoryId, AssigneeId, ReporterId, EstimatedHours, ActualHours, DueDate, StartedAt, CompletedAt, IsDeleted, DeletedAt, CreatedBy, UpdatedBy, CreatedAt, UpdatedAt)
    SELECT
        NEWID(),
        @Proj5,
        @i,
        CASE (@i % 4)
            WHEN 0 THEN 'Sistema ticketing con SLA #' + CAST(@i AS NVARCHAR)
            WHEN 1 THEN 'Knowledge base con search #' + CAST(@i AS NVARCHAR)
            WHEN 2 THEN 'Chat widget embedded #' + CAST(@i AS NVARCHAR)
            ELSE 'FAQ dinamiche per categoria #' + CAST(@i AS NVARCHAR)
        END,
        'Customer portal feature ' + CAST(@i AS NVARCHAR),
        CASE
            WHEN @i <= 2 THEN 4
            WHEN @i <= 4 THEN 3
            WHEN @i <= 6 THEN 2
            WHEN @i <= 9 THEN 1
            ELSE 0
        END,
        @i % 4,
        (SELECT TOP 1 Id FROM @Categories ORDER BY NEWID()),
        CASE WHEN @i <= 9 THEN @MainUserId ELSE NULL END,
        @MainUserId,
        (@i % 4 + 1) * 6,
        CASE WHEN @i <= 4 THEN (@i % 4 + 1) * 4 ELSE NULL END,
        CASE WHEN @i <= 9 THEN DATEADD(DAY, @i + 3, GETUTCDATE()) ELSE NULL END,
        CASE WHEN @i <= 6 THEN DATEADD(DAY, -@i, GETUTCDATE()) ELSE NULL END,
        CASE WHEN @i <= 2 THEN DATEADD(DAY, -@i, GETUTCDATE()) ELSE NULL END,
        0, NULL, @MainUserId, NULL,
        DATEADD(DAY, -10 + @i, GETUTCDATE()), NULL
    SET @i = @i + 1
END

-- Task per GATEWAY (10 task)
SET @i = 1
WHILE @i <= 10
BEGIN
    INSERT INTO ProjectTasks (Id, ProjectId, TaskNumber, Title, Description, Status, Priority, CategoryId, AssigneeId, ReporterId, EstimatedHours, ActualHours, DueDate, StartedAt, CompletedAt, IsDeleted, DeletedAt, CreatedBy, UpdatedBy, CreatedAt, UpdatedAt)
    SELECT
        NEWID(),
        @Proj6,
        @i,
        CASE (@i % 5)
            WHEN 0 THEN 'Rate limiting per API key #' + CAST(@i AS NVARCHAR)
            WHEN 1 THEN 'Caching con Redis #' + CAST(@i AS NVARCHAR)
            WHEN 2 THEN 'API versioning strategy #' + CAST(@i AS NVARCHAR)
            WHEN 3 THEN 'Request/response logging #' + CAST(@i AS NVARCHAR)
            ELSE 'Circuit breaker pattern #' + CAST(@i AS NVARCHAR)
        END,
        'API Gateway infrastructure ' + CAST(@i AS NVARCHAR),
        CASE
            WHEN @i <= 2 THEN 4
            WHEN @i <= 4 THEN 2
            WHEN @i <= 7 THEN 1
            ELSE 0
        END,
        @i % 4,
        (SELECT TOP 1 Id FROM @Categories ORDER BY NEWID()),
        CASE WHEN @i <= 7 THEN @MainUserId ELSE NULL END,
        @MainUserId,
        (@i % 3 + 2) * 8,
        CASE WHEN @i <= 4 THEN (@i % 3 + 1) * 6 ELSE NULL END,
        CASE WHEN @i <= 7 THEN DATEADD(DAY, @i + 7, GETUTCDATE()) ELSE NULL END,
        CASE WHEN @i <= 4 THEN DATEADD(DAY, -@i, GETUTCDATE()) ELSE NULL END,
        CASE WHEN @i <= 2 THEN DATEADD(DAY, -@i, GETUTCDATE()) ELSE NULL END,
        0, NULL, @MainUserId, NULL,
        DATEADD(DAY, -5 + @i, GETUTCDATE()), NULL
    SET @i = @i + 1
END

-- Task per LEGACY (completato - tutti Done)
SET @i = 1
WHILE @i <= 15
BEGIN
    INSERT INTO ProjectTasks (Id, ProjectId, TaskNumber, Title, Description, Status, Priority, CategoryId, AssigneeId, ReporterId, EstimatedHours, ActualHours, DueDate, StartedAt, CompletedAt, IsDeleted, DeletedAt, CreatedBy, UpdatedBy, CreatedAt, UpdatedAt)
    SELECT
        NEWID(),
        @Proj7,
        @i,
        CASE (@i % 5)
            WHEN 0 THEN 'Migrazione modulo utenti #' + CAST(@i AS NVARCHAR)
            WHEN 1 THEN 'Migrazione modulo ordini #' + CAST(@i AS NVARCHAR)
            WHEN 2 THEN 'Migrazione modulo prodotti #' + CAST(@i AS NVARCHAR)
            WHEN 3 THEN 'Data migration script #' + CAST(@i AS NVARCHAR)
            ELSE 'Testing regression #' + CAST(@i AS NVARCHAR)
        END,
        'Legacy migration completed task ' + CAST(@i AS NVARCHAR),
        4, -- Tutti Done
        @i % 4,
        (SELECT TOP 1 Id FROM @Categories ORDER BY NEWID()),
        @MainUserId,
        @MainUserId,
        (@i % 4 + 2) * 8,
        (@i % 4 + 1) * 7,
        DATEADD(MONTH, -2, GETUTCDATE()),
        DATEADD(MONTH, -3, GETUTCDATE()),
        DATEADD(MONTH, -2, GETUTCDATE()),
        0, NULL, @MainUserId, NULL,
        DATEADD(MONTH, -4, GETUTCDATE()), NULL
    SET @i = @i + 1
END

-- Task per TOOLS (8 task)
SET @i = 1
WHILE @i <= 8
BEGIN
    INSERT INTO ProjectTasks (Id, ProjectId, TaskNumber, Title, Description, Status, Priority, CategoryId, AssigneeId, ReporterId, EstimatedHours, ActualHours, DueDate, StartedAt, CompletedAt, IsDeleted, DeletedAt, CreatedBy, UpdatedBy, CreatedAt, UpdatedAt)
    SELECT
        NEWID(),
        @Proj8,
        @i,
        CASE (@i % 4)
            WHEN 0 THEN 'CLI tool per database backup #' + CAST(@i AS NVARCHAR)
            WHEN 1 THEN 'Script deploy automatico #' + CAST(@i AS NVARCHAR)
            WHEN 2 THEN 'Code generator templates #' + CAST(@i AS NVARCHAR)
            ELSE 'Performance profiler #' + CAST(@i AS NVARCHAR)
        END,
        'Internal tools development ' + CAST(@i AS NVARCHAR),
        CASE
            WHEN @i <= 3 THEN 4
            WHEN @i <= 5 THEN 2
            ELSE 1
        END,
        @i % 4,
        (SELECT TOP 1 Id FROM @Categories ORDER BY NEWID()),
        @MainUserId,
        @MainUserId,
        (@i % 2 + 1) * 8,
        CASE WHEN @i <= 5 THEN (@i % 2 + 1) * 6 ELSE NULL END,
        DATEADD(DAY, @i + 10, GETUTCDATE()),
        CASE WHEN @i <= 5 THEN DATEADD(DAY, -@i * 2, GETUTCDATE()) ELSE NULL END,
        CASE WHEN @i <= 3 THEN DATEADD(DAY, -@i, GETUTCDATE()) ELSE NULL END,
        0, NULL, @MainUserId, NULL,
        DATEADD(DAY, -20 + @i, GETUTCDATE()), NULL
    SET @i = @i + 1
END

-- ============================================
-- SUMMARY
-- ============================================
PRINT ''
PRINT '============================================'
PRINT 'SEED DATA COMPLETATO!'
PRINT '============================================'

SELECT 'Categorie' AS Entity, COUNT(*) AS Total FROM TaskCategories
UNION ALL
SELECT 'Progetti', COUNT(*) FROM Projects
UNION ALL
SELECT 'Membri', COUNT(*) FROM ProjectMembers
UNION ALL
SELECT 'Task', COUNT(*) FROM ProjectTasks

PRINT ''
PRINT 'Task per progetto:'
SELECT p.Code, p.Name, COUNT(t.Id) AS TaskCount
FROM Projects p
LEFT JOIN ProjectTasks t ON t.ProjectId = p.Id
GROUP BY p.Code, p.Name
ORDER BY p.Code

PRINT ''
PRINT 'Task per stato:'
SELECT
    CASE Status
        WHEN 0 THEN 'Backlog'
        WHEN 1 THEN 'Todo'
        WHEN 2 THEN 'InProgress'
        WHEN 3 THEN 'Review'
        WHEN 4 THEN 'Done'
    END AS Status,
    COUNT(*) AS Total
FROM ProjectTasks
GROUP BY Status
ORDER BY Status

GO
