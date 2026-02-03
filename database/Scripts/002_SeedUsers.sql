-- ============================================
-- CleanApi Seed Users Script
-- ============================================
-- Crea 10 utenti aggiuntivi copiando l'hash password
-- dall'utente principale (stessa password per tutti)
-- Eseguire DOPO 001_SeedData.sql
-- ============================================

USE [CleanApi]
GO

SET NOCOUNT ON

-- Recupera dati utente principale per copiare password hash
DECLARE @MainUserId NVARCHAR(450)
DECLARE @PasswordHash NVARCHAR(MAX)
DECLARE @SecurityStamp NVARCHAR(MAX)
DECLARE @ConcurrencyStamp NVARCHAR(MAX)

SELECT TOP 1
    @MainUserId = Id,
    @PasswordHash = PasswordHash,
    @SecurityStamp = SecurityStamp,
    @ConcurrencyStamp = ConcurrencyStamp
FROM AspNetUsers
ORDER BY Id

IF @MainUserId IS NULL
BEGIN
    RAISERROR('Nessun utente trovato. Registra almeno un utente prima.', 16, 1)
    RETURN
END

PRINT 'Copiando password hash da utente principale...'

-- ============================================
-- 1. CREAZIONE UTENTI (10 nuovi utenti)
-- ============================================
PRINT 'Creazione 10 utenti...'

DECLARE @User1 NVARCHAR(450) = NEWID()
DECLARE @User2 NVARCHAR(450) = NEWID()
DECLARE @User3 NVARCHAR(450) = NEWID()
DECLARE @User4 NVARCHAR(450) = NEWID()
DECLARE @User5 NVARCHAR(450) = NEWID()
DECLARE @User6 NVARCHAR(450) = NEWID()
DECLARE @User7 NVARCHAR(450) = NEWID()
DECLARE @User8 NVARCHAR(450) = NEWID()
DECLARE @User9 NVARCHAR(450) = NEWID()
DECLARE @User10 NVARCHAR(450) = NEWID()

INSERT INTO AspNetUsers (Id, UserName, NormalizedUserName, Email, NormalizedEmail, EmailConfirmed, PasswordHash, SecurityStamp, ConcurrencyStamp, PhoneNumber, PhoneNumberConfirmed, TwoFactorEnabled, LockoutEnd, LockoutEnabled, AccessFailedCount, FirstName, LastName, RefreshToken, RefreshTokenExpiryTime)
VALUES
    (@User1, 'marco.rossi@example.com', 'MARCO.ROSSI@EXAMPLE.COM', 'marco.rossi@example.com', 'MARCO.ROSSI@EXAMPLE.COM', 1, @PasswordHash, NEWID(), NEWID(), NULL, 0, 0, NULL, 1, 0, 'Marco', 'Rossi', NULL, NULL),
    (@User2, 'giulia.bianchi@example.com', 'GIULIA.BIANCHI@EXAMPLE.COM', 'giulia.bianchi@example.com', 'GIULIA.BIANCHI@EXAMPLE.COM', 1, @PasswordHash, NEWID(), NEWID(), NULL, 0, 0, NULL, 1, 0, 'Giulia', 'Bianchi', NULL, NULL),
    (@User3, 'luca.verdi@example.com', 'LUCA.VERDI@EXAMPLE.COM', 'luca.verdi@example.com', 'LUCA.VERDI@EXAMPLE.COM', 1, @PasswordHash, NEWID(), NEWID(), NULL, 0, 0, NULL, 1, 0, 'Luca', 'Verdi', NULL, NULL),
    (@User4, 'sofia.ferrari@example.com', 'SOFIA.FERRARI@EXAMPLE.COM', 'sofia.ferrari@example.com', 'SOFIA.FERRARI@EXAMPLE.COM', 1, @PasswordHash, NEWID(), NEWID(), NULL, 0, 0, NULL, 1, 0, 'Sofia', 'Ferrari', NULL, NULL),
    (@User5, 'alessandro.romano@example.com', 'ALESSANDRO.ROMANO@EXAMPLE.COM', 'alessandro.romano@example.com', 'ALESSANDRO.ROMANO@EXAMPLE.COM', 1, @PasswordHash, NEWID(), NEWID(), NULL, 0, 0, NULL, 1, 0, 'Alessandro', 'Romano', NULL, NULL),
    (@User6, 'chiara.colombo@example.com', 'CHIARA.COLOMBO@EXAMPLE.COM', 'chiara.colombo@example.com', 'CHIARA.COLOMBO@EXAMPLE.COM', 1, @PasswordHash, NEWID(), NEWID(), NULL, 0, 0, NULL, 1, 0, 'Chiara', 'Colombo', NULL, NULL),
    (@User7, 'andrea.ricci@example.com', 'ANDREA.RICCI@EXAMPLE.COM', 'andrea.ricci@example.com', 'ANDREA.RICCI@EXAMPLE.COM', 1, @PasswordHash, NEWID(), NEWID(), NULL, 0, 0, NULL, 1, 0, 'Andrea', 'Ricci', NULL, NULL),
    (@User8, 'elena.marino@example.com', 'ELENA.MARINO@EXAMPLE.COM', 'elena.marino@example.com', 'ELENA.MARINO@EXAMPLE.COM', 1, @PasswordHash, NEWID(), NEWID(), NULL, 0, 0, NULL, 1, 0, 'Elena', 'Marino', NULL, NULL),
    (@User9, 'francesco.galli@example.com', 'FRANCESCO.GALLI@EXAMPLE.COM', 'francesco.galli@example.com', 'FRANCESCO.GALLI@EXAMPLE.COM', 1, @PasswordHash, NEWID(), NEWID(), NULL, 0, 0, NULL, 1, 0, 'Francesco', 'Galli', NULL, NULL),
    (@User10, 'valentina.conti@example.com', 'VALENTINA.CONTI@EXAMPLE.COM', 'valentina.conti@example.com', 'VALENTINA.CONTI@EXAMPLE.COM', 1, @PasswordHash, NEWID(), NEWID(), NULL, 0, 0, NULL, 1, 0, 'Valentina', 'Conti', NULL, NULL)

PRINT 'Utenti creati: 10'

-- ============================================
-- 2. AGGIUNTA MEMBRI AI PROGETTI
-- ============================================
PRINT 'Aggiunta membri ai progetti...'

-- Recupera ID progetti
DECLARE @ProjClean UNIQUEIDENTIFIER = (SELECT Id FROM Projects WHERE Code = 'CLEAN')
DECLARE @ProjMobile UNIQUEIDENTIFIER = (SELECT Id FROM Projects WHERE Code = 'MOBILE')
DECLARE @ProjEcom UNIQUEIDENTIFIER = (SELECT Id FROM Projects WHERE Code = 'ECOM')
DECLARE @ProjAnalytics UNIQUEIDENTIFIER = (SELECT Id FROM Projects WHERE Code = 'ANALYTICS')
DECLARE @ProjPortal UNIQUEIDENTIFIER = (SELECT Id FROM Projects WHERE Code = 'PORTAL')
DECLARE @ProjGateway UNIQUEIDENTIFIER = (SELECT Id FROM Projects WHERE Code = 'GATEWAY')
DECLARE @ProjLegacy UNIQUEIDENTIFIER = (SELECT Id FROM Projects WHERE Code = 'LEGACY')
DECLARE @ProjTools UNIQUEIDENTIFIER = (SELECT Id FROM Projects WHERE Code = 'TOOLS')

-- Ruoli: 0=Viewer, 1=Developer, 2=Admin, 3=Owner

-- CLEAN: Team completo (6 membri)
INSERT INTO ProjectMembers (Id, ProjectId, UserId, Role, JoinedAt, IsActive, CreatedAt, UpdatedAt)
VALUES
    (NEWID(), @ProjClean, @User1, 2, DATEADD(MONTH, -2, GETUTCDATE()), 1, GETUTCDATE(), NULL),  -- Marco: Admin
    (NEWID(), @ProjClean, @User2, 1, DATEADD(MONTH, -2, GETUTCDATE()), 1, GETUTCDATE(), NULL),  -- Giulia: Developer
    (NEWID(), @ProjClean, @User3, 1, DATEADD(MONTH, -1, GETUTCDATE()), 1, GETUTCDATE(), NULL),  -- Luca: Developer
    (NEWID(), @ProjClean, @User4, 1, DATEADD(WEEK, -3, GETUTCDATE()), 1, GETUTCDATE(), NULL),   -- Sofia: Developer
    (NEWID(), @ProjClean, @User8, 0, DATEADD(WEEK, -1, GETUTCDATE()), 1, GETUTCDATE(), NULL)    -- Elena: Viewer

-- MOBILE: Team mobile (4 membri)
INSERT INTO ProjectMembers (Id, ProjectId, UserId, Role, JoinedAt, IsActive, CreatedAt, UpdatedAt)
VALUES
    (NEWID(), @ProjMobile, @User3, 2, DATEADD(MONTH, -1, GETUTCDATE()), 1, GETUTCDATE(), NULL), -- Luca: Admin
    (NEWID(), @ProjMobile, @User5, 1, DATEADD(MONTH, -1, GETUTCDATE()), 1, GETUTCDATE(), NULL), -- Alessandro: Developer
    (NEWID(), @ProjMobile, @User6, 1, DATEADD(WEEK, -2, GETUTCDATE()), 1, GETUTCDATE(), NULL)   -- Chiara: Developer

-- ECOM: Team e-commerce (4 membri)
INSERT INTO ProjectMembers (Id, ProjectId, UserId, Role, JoinedAt, IsActive, CreatedAt, UpdatedAt)
VALUES
    (NEWID(), @ProjEcom, @User2, 2, DATEADD(WEEK, -3, GETUTCDATE()), 1, GETUTCDATE(), NULL),    -- Giulia: Admin
    (NEWID(), @ProjEcom, @User7, 1, DATEADD(WEEK, -2, GETUTCDATE()), 1, GETUTCDATE(), NULL),    -- Andrea: Developer
    (NEWID(), @ProjEcom, @User9, 1, DATEADD(WEEK, -1, GETUTCDATE()), 1, GETUTCDATE(), NULL)     -- Francesco: Developer

-- ANALYTICS: Team analytics (3 membri)
INSERT INTO ProjectMembers (Id, ProjectId, UserId, Role, JoinedAt, IsActive, CreatedAt, UpdatedAt)
VALUES
    (NEWID(), @ProjAnalytics, @User4, 2, DATEADD(WEEK, -2, GETUTCDATE()), 1, GETUTCDATE(), NULL), -- Sofia: Admin
    (NEWID(), @ProjAnalytics, @User10, 1, DATEADD(WEEK, -1, GETUTCDATE()), 1, GETUTCDATE(), NULL) -- Valentina: Developer

-- PORTAL: Team support (3 membri)
INSERT INTO ProjectMembers (Id, ProjectId, UserId, Role, JoinedAt, IsActive, CreatedAt, UpdatedAt)
VALUES
    (NEWID(), @ProjPortal, @User6, 2, DATEADD(WEEK, -1, GETUTCDATE()), 1, GETUTCDATE(), NULL),  -- Chiara: Admin
    (NEWID(), @ProjPortal, @User8, 1, DATEADD(WEEK, -1, GETUTCDATE()), 1, GETUTCDATE(), NULL)   -- Elena: Developer

-- GATEWAY: Team infra (3 membri)
INSERT INTO ProjectMembers (Id, ProjectId, UserId, Role, JoinedAt, IsActive, CreatedAt, UpdatedAt)
VALUES
    (NEWID(), @ProjGateway, @User1, 2, DATEADD(DAY, -5, GETUTCDATE()), 1, GETUTCDATE(), NULL),  -- Marco: Admin
    (NEWID(), @ProjGateway, @User5, 1, DATEADD(DAY, -3, GETUTCDATE()), 1, GETUTCDATE(), NULL)   -- Alessandro: Developer

-- LEGACY: Team migrazione (completato, 2 membri)
INSERT INTO ProjectMembers (Id, ProjectId, UserId, Role, JoinedAt, IsActive, CreatedAt, UpdatedAt)
VALUES
    (NEWID(), @ProjLegacy, @User7, 1, DATEADD(MONTH, -5, GETUTCDATE()), 1, GETUTCDATE(), NULL)  -- Andrea: Developer

-- TOOLS: Team tools (2 membri)
INSERT INTO ProjectMembers (Id, ProjectId, UserId, Role, JoinedAt, IsActive, CreatedAt, UpdatedAt)
VALUES
    (NEWID(), @ProjTools, @User9, 1, DATEADD(MONTH, -3, GETUTCDATE()), 1, GETUTCDATE(), NULL)   -- Francesco: Developer

PRINT 'Membri aggiunti ai progetti: 22'

-- ============================================
-- 3. ASSEGNAZIONE TASK AI NUOVI UTENTI
-- ============================================
PRINT 'Riassegnazione task ai membri del team...'

-- Distribuisci task CLEAN tra i membri
UPDATE ProjectTasks SET AssigneeId = @User1 WHERE ProjectId = @ProjClean AND TaskNumber IN (2, 7, 12)
UPDATE ProjectTasks SET AssigneeId = @User2 WHERE ProjectId = @ProjClean AND TaskNumber IN (3, 8, 13)
UPDATE ProjectTasks SET AssigneeId = @User3 WHERE ProjectId = @ProjClean AND TaskNumber IN (4, 9, 14)
UPDATE ProjectTasks SET AssigneeId = @User4 WHERE ProjectId = @ProjClean AND TaskNumber IN (5, 10, 15)

-- Distribuisci task MOBILE tra i membri
UPDATE ProjectTasks SET AssigneeId = @User3 WHERE ProjectId = @ProjMobile AND TaskNumber IN (1, 4)
UPDATE ProjectTasks SET AssigneeId = @User5 WHERE ProjectId = @ProjMobile AND TaskNumber IN (2, 5)
UPDATE ProjectTasks SET AssigneeId = @User6 WHERE ProjectId = @ProjMobile AND TaskNumber IN (3, 6)

-- Distribuisci task ECOM tra i membri
UPDATE ProjectTasks SET AssigneeId = @User2 WHERE ProjectId = @ProjEcom AND TaskNumber IN (1, 4, 7)
UPDATE ProjectTasks SET AssigneeId = @User7 WHERE ProjectId = @ProjEcom AND TaskNumber IN (2, 5, 8)
UPDATE ProjectTasks SET AssigneeId = @User9 WHERE ProjectId = @ProjEcom AND TaskNumber IN (3, 6, 9)

-- Distribuisci task ANALYTICS tra i membri
UPDATE ProjectTasks SET AssigneeId = @User4 WHERE ProjectId = @ProjAnalytics AND TaskNumber IN (1, 3, 5)
UPDATE ProjectTasks SET AssigneeId = @User10 WHERE ProjectId = @ProjAnalytics AND TaskNumber IN (2, 4, 6)

-- Distribuisci task PORTAL tra i membri
UPDATE ProjectTasks SET AssigneeId = @User6 WHERE ProjectId = @ProjPortal AND TaskNumber IN (1, 3, 5)
UPDATE ProjectTasks SET AssigneeId = @User8 WHERE ProjectId = @ProjPortal AND TaskNumber IN (2, 4, 6)

-- Distribuisci task GATEWAY tra i membri
UPDATE ProjectTasks SET AssigneeId = @User1 WHERE ProjectId = @ProjGateway AND TaskNumber IN (1, 3, 5)
UPDATE ProjectTasks SET AssigneeId = @User5 WHERE ProjectId = @ProjGateway AND TaskNumber IN (2, 4)

-- Distribuisci task LEGACY (tutti completati)
UPDATE ProjectTasks SET AssigneeId = @User7 WHERE ProjectId = @ProjLegacy AND TaskNumber % 2 = 0

-- Distribuisci task TOOLS
UPDATE ProjectTasks SET AssigneeId = @User9 WHERE ProjectId = @ProjTools AND TaskNumber IN (2, 4, 6)

PRINT 'Task riassegnati ai membri del team'

-- ============================================
-- SUMMARY
-- ============================================
PRINT ''
PRINT '============================================'
PRINT 'SEED USERS COMPLETATO!'
PRINT '============================================'

PRINT ''
PRINT 'Utenti totali:'
SELECT COUNT(*) AS TotalUsers FROM AspNetUsers

PRINT ''
PRINT 'Lista utenti:'
SELECT
    FirstName + ' ' + LastName AS FullName,
    Email,
    CASE
        WHEN Id = @MainUserId THEN 'Tu (Owner)'
        ELSE 'Team Member'
    END AS Role
FROM AspNetUsers
ORDER BY
    CASE WHEN Id = @MainUserId THEN 0 ELSE 1 END,
    FirstName

PRINT ''
PRINT 'Membri per progetto:'
SELECT
    p.Code,
    p.Name,
    COUNT(pm.Id) AS MemberCount
FROM Projects p
LEFT JOIN ProjectMembers pm ON pm.ProjectId = p.Id
GROUP BY p.Code, p.Name
ORDER BY p.Code

PRINT ''
PRINT 'Task assegnati per utente:'
SELECT
    ISNULL(u.FirstName + ' ' + u.LastName, 'Non assegnato') AS Assignee,
    COUNT(t.Id) AS TaskCount
FROM ProjectTasks t
LEFT JOIN AspNetUsers u ON u.Id = t.AssigneeId
GROUP BY u.FirstName, u.LastName
ORDER BY TaskCount DESC

PRINT ''
PRINT 'NOTA: Tutti gli utenti hanno la stessa password del tuo account!'
GO
