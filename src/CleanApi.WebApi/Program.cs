using System.Text.Json.Serialization;
using CleanApi.Application;
using CleanApi.Infrastructure;
using CleanApi.Infrastructure.BackgroundJobs;
using CleanApi.Infrastructure.Data;
using CleanApi.WebApi.Middleware;
using Hangfire;
using Microsoft.OpenApi.Models;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

Console.WriteLine("=== App starting ===");

// Serilog
builder.Host.UseSerilog((context, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration));

// Add services
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "CleanApi - Risk Management Platform",
        Version = "v1",
        Description = "Risk Management Platform API"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Health Checks
builder.Services.AddHealthChecks();

Console.WriteLine("=== Building app ===");
var app = builder.Build();
Console.WriteLine("=== App built ===");

// Seed database
try
{
    Console.WriteLine("=== Seeding... ===");
    await DbSeeder.SeedDatabaseAsync(app.Services);
    Console.WriteLine("=== Seed done ===");
}
catch (Exception ex)
{
    Console.WriteLine($"=== Seed FAILED: {ex.Message} ===");
}

// Middleware pipeline
app.UseExceptionHandling();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

// Hangfire Dashboard (development only, no auth required)
if (app.Environment.IsDevelopment())
{
    app.MapHangfireDashboard("/hangfire");
}

app.MapControllers();
app.MapHealthChecks("/health");

// Configure recurring jobs
try
{
    RecurringJob.AddOrUpdate<CleanupExpiredTokensJob>(
        "cleanup-expired-tokens",
        job => job.ExecuteAsync(),
        Cron.Daily);
}
catch (Exception ex)
{
    Console.WriteLine($"=== Hangfire job FAILED: {ex.Message} ===");
}

Console.WriteLine("=== Starting app.Run() ===");
app.Run();
