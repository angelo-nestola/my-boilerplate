using CleanApi.Domain.Entities;
using CleanApi.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace CleanApi.Infrastructure.Data;

public class DbSeeder
{
    private readonly ApplicationDbContext _context;
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DbSeeder> _logger;

    public DbSeeder(ApplicationDbContext context, IServiceProvider serviceProvider, ILogger<DbSeeder> logger)
    {
        _context = context;
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        Console.WriteLine("=== Seed: checking OrgRoles... ===");
        if (await _context.OrgRoles.AnyAsync())
        {
            Console.WriteLine("=== Seed: data exists, skipping ===");
            _logger.LogInformation("Seed data already exists, skipping");
            return;
        }
        Console.WriteLine("=== Seed: no data, seeding... ===");

        _logger.LogInformation("Seeding organization data...");

        // Seed OrgRoles
        var roles = new Dictionary<string, OrgRole>
        {
            ["CEO"] = new() { Code = "CEO", Name = "CEO", Description = "Chief Executive Officer" },
            ["GENERAL_MANAGER"] = new() { Code = "GENERAL_MANAGER", Name = "General Manager", Description = "General Manager" },
            ["BUSINESS_LEADER"] = new() { Code = "BUSINESS_LEADER", Name = "Business Leader", Description = "Business Leader / Orbit Lead" },
            ["TECHNICAL_ARCHITECT"] = new() { Code = "TECHNICAL_ARCHITECT", Name = "Technical Architect", Description = "Technical Architect" },
            ["TECHNICAL_SUPPORT"] = new() { Code = "TECHNICAL_SUPPORT", Name = "Technical Support", Description = "Technical Support" },
            ["COMPETENCE_LEAD"] = new() { Code = "COMPETENCE_LEAD", Name = "Competence Lead", Description = "Competence Center Lead" },
            ["TALENT_LEAD"] = new() { Code = "TALENT_LEAD", Name = "Talent Lead", Description = "Talent Based Lead" },
            ["TALENT_SPECIALIST"] = new() { Code = "TALENT_SPECIALIST", Name = "Talent Specialist", Description = "Talent Based Specialist" },
            ["HR_LEAD"] = new() { Code = "HR_LEAD", Name = "HR Lead", Description = "Human Resources Lead" },
            ["HR_SPECIALIST"] = new() { Code = "HR_SPECIALIST", Name = "HR Specialist", Description = "Human Resources Specialist" },
            ["ADMINISTRATION_LEAD"] = new() { Code = "ADMINISTRATION_LEAD", Name = "Administration Lead", Description = "Administration Lead" },
            ["ADMINISTRATION_SPECIALIST"] = new() { Code = "ADMINISTRATION_SPECIALIST", Name = "Administration Specialist", Description = "Administration Specialist" },
            ["MARKETING_LEAD"] = new() { Code = "MARKETING_LEAD", Name = "Marketing Lead", Description = "Marketing Lead" },
            ["MARKETING_SPECIALIST"] = new() { Code = "MARKETING_SPECIALIST", Name = "Marketing Specialist", Description = "Marketing Specialist" },
            ["BUSINESS_MANAGER"] = new() { Code = "BUSINESS_MANAGER", Name = "Business Manager", Description = "Responsible for all Business Leaders, can lead an Orbit" },
            ["PLATFORM_ADMIN"] = new() { Code = "PLATFORM_ADMIN", Name = "Platform Admin", Description = "Application administrator with full access" },
        };

        _context.OrgRoles.AddRange(roles.Values);

        // Seed Capabilities
        var capabilities = new Dictionary<string, Capability>
        {
            ["ORGUNIT_MANAGE"] = new() { Code = "ORGUNIT_MANAGE", Name = "Manage OrgUnits", Group = "Organization", Description = "Create/edit/deactivate OrgUnits" },
            ["PERSON_MANAGE"] = new() { Code = "PERSON_MANAGE", Name = "Manage Persons", Group = "Organization", Description = "Create/edit persons and assignments" },
            ["ROLE_MANAGE"] = new() { Code = "ROLE_MANAGE", Name = "Manage Roles", Group = "Organization", Description = "Manage roles and capability mapping" },
            ["CAPABILITY_MANAGE"] = new() { Code = "CAPABILITY_MANAGE", Name = "Manage Capabilities", Group = "Organization", Description = "Edit capabilities (super-admin)" },
            ["MISSION_CREATE"] = new() { Code = "MISSION_CREATE", Name = "Create Mission", Group = "Mission", Description = "Create new Missions" },
            ["MISSION_EDIT"] = new() { Code = "MISSION_EDIT", Name = "Edit Mission", Group = "Mission", Description = "Edit existing Missions" },
            ["MISSION_VIEW"] = new() { Code = "MISSION_VIEW", Name = "View Mission", Group = "Mission", Description = "View Missions" },
            ["ASSESSMENT_CREATE"] = new() { Code = "ASSESSMENT_CREATE", Name = "Create Assessment", Group = "Assessment", Description = "Start new assessment" },
            ["ASSESSMENT_SUBMIT"] = new() { Code = "ASSESSMENT_SUBMIT", Name = "Submit Assessment", Group = "Assessment", Description = "Submit assessment for review" },
            ["ASSESSMENT_APPROVE"] = new() { Code = "ASSESSMENT_APPROVE", Name = "Approve Assessment", Group = "Assessment", Description = "Approve assessment" },
            ["ASSESSMENT_REJECT"] = new() { Code = "ASSESSMENT_REJECT", Name = "Reject Assessment", Group = "Assessment", Description = "Reject assessment" },
            ["RISK_CRUD"] = new() { Code = "RISK_CRUD", Name = "Manage Risks", Group = "Risk", Description = "Create/edit/delete risks" },
            ["RISK_COMMENT"] = new() { Code = "RISK_COMMENT", Name = "Comment Risks", Group = "Risk", Description = "Comment on risks" },
            ["DOSSIER_EXPORT"] = new() { Code = "DOSSIER_EXPORT", Name = "Export Dossier", Group = "Report", Description = "Export Risk Dossier PDF" },
            ["ESCALATE_TO_CC"] = new() { Code = "ESCALATE_TO_CC", Name = "Escalate to CC", Group = "Escalation", Description = "Send escalation to Command Center" },
            ["CC_VIEW"] = new() { Code = "CC_VIEW", Name = "View Command Center", Group = "Escalation", Description = "View Command Center dashboard" },
            ["CC_BLOCK"] = new() { Code = "CC_BLOCK", Name = "Block Mission", Group = "Escalation", Description = "Block Mission" },
            ["CC_UNBLOCK"] = new() { Code = "CC_UNBLOCK", Name = "Unblock Mission", Group = "Escalation", Description = "Unblock Mission" },
        };

        _context.Capabilities.AddRange(capabilities.Values);
        await _context.SaveChangesAsync();

        // Seed RoleCapability mappings
        var mappings = new Dictionary<string, string[]>
        {
            ["CEO"] = ["CC_VIEW", "CC_BLOCK", "CC_UNBLOCK", "MISSION_VIEW", "DOSSIER_EXPORT"],
            ["GENERAL_MANAGER"] = ["CC_VIEW", "CC_BLOCK", "CC_UNBLOCK", "MISSION_VIEW", "DOSSIER_EXPORT"],
            ["BUSINESS_LEADER"] = ["MISSION_CREATE", "MISSION_EDIT", "MISSION_VIEW", "ASSESSMENT_CREATE", "ASSESSMENT_APPROVE", "ASSESSMENT_REJECT", "DOSSIER_EXPORT", "ESCALATE_TO_CC"],
            ["TECHNICAL_ARCHITECT"] = ["MISSION_VIEW", "ASSESSMENT_CREATE", "RISK_CRUD", "RISK_COMMENT", "DOSSIER_EXPORT"],
            ["TECHNICAL_SUPPORT"] = ["MISSION_VIEW", "RISK_CRUD", "RISK_COMMENT"],
            ["COMPETENCE_LEAD"] = ["MISSION_VIEW", "ASSESSMENT_CREATE", "RISK_CRUD", "RISK_COMMENT", "PERSON_MANAGE"],
            ["TALENT_LEAD"] = ["PERSON_MANAGE", "MISSION_VIEW"],
            ["TALENT_SPECIALIST"] = ["PERSON_MANAGE", "MISSION_VIEW"],
            ["HR_LEAD"] = ["PERSON_MANAGE", "ORGUNIT_MANAGE", "MISSION_VIEW"],
            ["HR_SPECIALIST"] = ["PERSON_MANAGE", "MISSION_VIEW"],
            ["ADMINISTRATION_LEAD"] = ["ORGUNIT_MANAGE", "PERSON_MANAGE", "MISSION_VIEW"],
            ["ADMINISTRATION_SPECIALIST"] = ["MISSION_VIEW"],
            ["MARKETING_LEAD"] = ["MISSION_VIEW"],
            ["MARKETING_SPECIALIST"] = ["MISSION_VIEW"],
            ["BUSINESS_MANAGER"] = ["MISSION_CREATE", "MISSION_EDIT", "MISSION_VIEW", "ASSESSMENT_CREATE", "ASSESSMENT_APPROVE", "ASSESSMENT_REJECT", "DOSSIER_EXPORT", "ESCALATE_TO_CC", "CC_VIEW"],
            ["PLATFORM_ADMIN"] = capabilities.Keys.ToArray(),
        };

        foreach (var (roleCode, capCodes) in mappings)
        {
            var role = roles[roleCode];
            foreach (var capCode in capCodes)
            {
                var cap = capabilities[capCode];
                _context.RoleCapabilities.Add(new RoleCapability
                {
                    OrgRoleId = role.Id,
                    CapabilityId = cap.Id
                });
            }
        }

        await _context.SaveChangesAsync();

        // Seed admin user
        await SeedAdminUserAsync(roles["PLATFORM_ADMIN"]);

        _logger.LogInformation("Organization seed data created successfully");
    }

    private async Task SeedAdminUserAsync(OrgRole platformAdminRole)
    {
        const string adminEmail = "admin@riskplatform.com";
        const string adminPassword = "Admin123!";

        var userManager = _serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        var existingUser = await userManager.FindByEmailAsync(adminEmail);
        if (existingUser != null) return;

        var user = new ApplicationUser
        {
            UserName = adminEmail,
            Email = adminEmail,
            FirstName = "Platform",
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(user, adminPassword);
        if (!result.Succeeded)
        {
            _logger.LogError("Failed to create admin user: {Errors}", string.Join(", ", result.Errors.Select(e => e.Description)));
            return;
        }

        // Create org structure
        var commandCenter = new OrgUnit
        {
            Code = "CC",
            Name = "Command Center",
            Type = Domain.Enums.OrgUnitType.StaffGroup,
            Status = Domain.Enums.OrgUnitStatus.Active
        };
        _context.OrgUnits.Add(commandCenter);
        await _context.SaveChangesAsync();

        var techHub = new OrgUnit
        {
            Code = "THUB",
            Name = "Technical Hub",
            Type = Domain.Enums.OrgUnitType.TechnicalHub,
            Status = Domain.Enums.OrgUnitStatus.Active,
            ParentId = commandCenter.Id
        };

        var talentBased = new OrgUnit
        {
            Code = "TB",
            Name = "Talent Based",
            Type = Domain.Enums.OrgUnitType.StaffGroup,
            Status = Domain.Enums.OrgUnitStatus.Active,
            ParentId = commandCenter.Id
        };

        var hr = new OrgUnit
        {
            Code = "HR",
            Name = "HR",
            Type = Domain.Enums.OrgUnitType.StaffGroup,
            Status = Domain.Enums.OrgUnitStatus.Active,
            ParentId = commandCenter.Id
        };

        var marketing = new OrgUnit
        {
            Code = "MKT",
            Name = "Marketing",
            Type = Domain.Enums.OrgUnitType.StaffGroup,
            Status = Domain.Enums.OrgUnitStatus.Active,
            ParentId = commandCenter.Id
        };

        var administration = new OrgUnit
        {
            Code = "ADM",
            Name = "Administration",
            Type = Domain.Enums.OrgUnitType.StaffGroup,
            Status = Domain.Enums.OrgUnitStatus.Active,
            ParentId = commandCenter.Id
        };

        _context.OrgUnits.AddRange(techHub, talentBased, hr, marketing, administration);
        await _context.SaveChangesAsync();

        // Seed Orbits under Command Center
        var orbits = new[]
        {
            new OrgUnit { Code = "ORBYT-1", Name = "ORBYT-1 Mobility & Industrial", Type = Domain.Enums.OrgUnitType.Orbit, Status = Domain.Enums.OrgUnitStatus.Active, ParentId = commandCenter.Id, Domain = "Transportation, Automotive, Industrial/Manufacturing" },
            new OrgUnit { Code = "ORBYT-2", Name = "ORBYT-2 Financial Services", Type = Domain.Enums.OrgUnitType.Orbit, Status = Domain.Enums.OrgUnitStatus.Active, ParentId = commandCenter.Id, Domain = "Banking, Payment, Insurance" },
            new OrgUnit { Code = "ORBYT-3", Name = "ORBYT-3 Fashion, Retail & Entertainment", Type = Domain.Enums.OrgUnitType.Orbit, Status = Domain.Enums.OrgUnitStatus.Active, ParentId = commandCenter.Id, Domain = "Fashion, Luxury, Retail, Gaming, Sport Brand" },
            new OrgUnit { Code = "ORBYT-4", Name = "ORBYT-4 Energy, Telco, Spaces, PA", Type = Domain.Enums.OrgUnitType.Orbit, Status = Domain.Enums.OrgUnitStatus.Active, ParentId = commandCenter.Id, Domain = "Aerospace, Energy, Utilities, Telco, PA" },
            new OrgUnit { Code = "ORBYT-5", Name = "ORBYT-5 SMB", Type = Domain.Enums.OrgUnitType.Orbit, Status = Domain.Enums.OrgUnitStatus.Active, ParentId = commandCenter.Id, Domain = "Small & Medium Business" },
            new OrgUnit { Code = "ORBYT-RD", Name = "ORBYT-R&D", Type = Domain.Enums.OrgUnitType.Orbit, Status = Domain.Enums.OrgUnitStatus.Active, ParentId = commandCenter.Id, Domain = "Progetti finanziati" },
            new OrgUnit { Code = "ORBYT-LAB", Name = "ORBYT-Lab", Type = Domain.Enums.OrgUnitType.Orbit, Status = Domain.Enums.OrgUnitStatus.Active, ParentId = commandCenter.Id, Domain = "Progetti interni, POC" },
        };
        _context.OrgUnits.AddRange(orbits);
        await _context.SaveChangesAsync();

        // Seed Competence Centers under Technical Hub
        var competenceCenters = new[]
        {
            new OrgUnit { Code = "BCO", Name = "BCO Enterprise Platforms", Type = Domain.Enums.OrgUnitType.CompetenceCenter, Status = Domain.Enums.OrgUnitStatus.Active, ParentId = techHub.Id, Domain = "Consultancy (Dynamics 365)" },
            new OrgUnit { Code = "WEB", Name = "WEB CMS UI", Type = Domain.Enums.OrgUnitType.CompetenceCenter, Status = Domain.Enums.OrgUnitStatus.Active, ParentId = techHub.Id, Domain = "Web Touchpoints & CMS" },
            new OrgUnit { Code = "MOB", Name = "MOB Mobile", Type = Domain.Enums.OrgUnitType.CompetenceCenter, Status = Domain.Enums.OrgUnitStatus.Active, ParentId = techHub.Id },
            new OrgUnit { Code = "SWE1", Name = "SWE1 SW Engineer NET", Type = Domain.Enums.OrgUnitType.CompetenceCenter, Status = Domain.Enums.OrgUnitStatus.Active, ParentId = techHub.Id, Domain = ".NET software engineering" },
            new OrgUnit { Code = "SWA1", Name = "SWA1 SW Automation NET", Type = Domain.Enums.OrgUnitType.CompetenceCenter, Status = Domain.Enums.OrgUnitStatus.Active, ParentId = techHub.Id, Domain = ".NET process automation" },
            new OrgUnit { Code = "SWE2", Name = "SWE2 SW Engineer OPEN", Type = Domain.Enums.OrgUnitType.CompetenceCenter, Status = Domain.Enums.OrgUnitStatus.Active, ParentId = techHub.Id, Domain = "Open-source software engineering" },
            new OrgUnit { Code = "SWA2", Name = "SWA2 SW Automation OPEN", Type = Domain.Enums.OrgUnitType.CompetenceCenter, Status = Domain.Enums.OrgUnitStatus.Active, ParentId = techHub.Id, Domain = "Open-source process automation" },
            new OrgUnit { Code = "RTD", Name = "RTD Real Time Solutions", Type = Domain.Enums.OrgUnitType.CompetenceCenter, Status = Domain.Enums.OrgUnitStatus.Active, ParentId = techHub.Id },
            new OrgUnit { Code = "INFRA", Name = "INFRA Infrastructure On Prem", Type = Domain.Enums.OrgUnitType.CompetenceCenter, Status = Domain.Enums.OrgUnitStatus.Active, ParentId = techHub.Id },
            new OrgUnit { Code = "CLOUD", Name = "CLOUD Cloud Infrastructure", Type = Domain.Enums.OrgUnitType.CompetenceCenter, Status = Domain.Enums.OrgUnitStatus.Active, ParentId = techHub.Id },
            new OrgUnit { Code = "DAN", Name = "DAN Analytics", Type = Domain.Enums.OrgUnitType.CompetenceCenter, Status = Domain.Enums.OrgUnitStatus.Active, ParentId = techHub.Id },
            new OrgUnit { Code = "AI", Name = "AI AI Engineering", Type = Domain.Enums.OrgUnitType.CompetenceCenter, Status = Domain.Enums.OrgUnitStatus.Active, ParentId = techHub.Id },
            new OrgUnit { Code = "ASSITECH", Name = "Assitech", Type = Domain.Enums.OrgUnitType.CompetenceCenter, Status = Domain.Enums.OrgUnitStatus.Active, ParentId = techHub.Id },
        };
        _context.OrgUnits.AddRange(competenceCenters);
        await _context.SaveChangesAsync();

        // Seed admin person + assignment to Command Center
        var person = new Person
        {
            FirstName = "Platform",
            LastName = "Admin",
            Email = adminEmail,
            UserId = user.Id
        };
        _context.Persons.Add(person);
        await _context.SaveChangesAsync();

        _context.OrgAssignments.Add(new OrgAssignment
        {
            PersonId = person.Id,
            OrgUnitId = commandCenter.Id,
            OrgRoleId = platformAdminRole.Id,
            ValidFrom = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        _logger.LogInformation("Admin user and org structure seeded: {Email}", adminEmail);
    }

    public static async Task SeedDatabaseAsync(IServiceProvider serviceProvider)
    {
        Console.WriteLine("=== Seed: creating scope... ===");
        using var scope = serviceProvider.CreateScope();
        Console.WriteLine("=== Seed: resolving ApplicationDbContext... ===");
        var ctx = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        Console.WriteLine("=== Seed: context OK, resolving DbSeeder... ===");
        var seeder = scope.ServiceProvider.GetRequiredService<DbSeeder>();
        Console.WriteLine("=== Seed: DbSeeder resolved, calling SeedAsync... ===");
        await seeder.SeedAsync();
        Console.WriteLine("=== Seed: SeedAsync completed ===");
    }
}
