using System.CommandLine;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TrelloSync.Commands;
using TrelloSync.Configuration;
using TrelloSync.Services;

namespace TrelloSync;

class Program
{
    static async Task<int> Main(string[] args)
    {
        var services = ConfigureServices();

        var rootCommand = new RootCommand("TrelloSync - Sync development tasks from YAML to Trello")
        {
            CreateInitCommand(services),
            CreatePushCommand(services),
            CreateStatusCommand(services),
            CreatePullStatusCommand(services)
        };

        return await rootCommand.InvokeAsync(args);
    }

    private static IServiceProvider ConfigureServices()
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(AppContext.BaseDirectory)
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .Build();

        var services = new ServiceCollection();

        // Configuration
        services.Configure<TrelloSettings>(configuration.GetSection("Trello"));
        services.Configure<PathSettings>(configuration.GetSection("Paths"));

        // Register settings directly for easier access
        var trelloSettings = configuration.GetSection("Trello").Get<TrelloSettings>() ?? new TrelloSettings();
        var pathSettings = configuration.GetSection("Paths").Get<PathSettings>() ?? new PathSettings();
        services.AddSingleton(trelloSettings);
        services.AddSingleton(pathSettings);

        // Services
        services.AddSingleton<IYamlParser, YamlParser>();
        services.AddSingleton<ITrelloClientWrapper, TrelloClientWrapper>();
        services.AddSingleton<ISyncService, SyncService>();

        return services.BuildServiceProvider();
    }

    private static Command CreateInitCommand(IServiceProvider services)
    {
        var command = new Command("init", "Initialize Trello board with lists and labels");

        command.SetHandler(async () =>
        {
            var handler = new InitCommand(
                services.GetRequiredService<ITrelloClientWrapper>(),
                services.GetRequiredService<ISyncService>(),
                services.GetRequiredService<TrelloSettings>(),
                services.GetRequiredService<PathSettings>());
            await handler.ExecuteAsync();
        });

        return command;
    }

    private static Command CreatePushCommand(IServiceProvider services)
    {
        var command = new Command("push", "Sync tasks from YAML to Trello");

        command.SetHandler(async () =>
        {
            var handler = new PushCommand(
                services.GetRequiredService<IYamlParser>(),
                services.GetRequiredService<ITrelloClientWrapper>(),
                services.GetRequiredService<ISyncService>(),
                services.GetRequiredService<PathSettings>());
            await handler.ExecuteAsync();
        });

        return command;
    }

    private static Command CreateStatusCommand(IServiceProvider services)
    {
        var command = new Command("status", "Show differences between local and Trello");

        command.SetHandler(async () =>
        {
            var handler = new StatusCommand(
                services.GetRequiredService<IYamlParser>(),
                services.GetRequiredService<ITrelloClientWrapper>(),
                services.GetRequiredService<ISyncService>(),
                services.GetRequiredService<PathSettings>());
            await handler.ExecuteAsync();
        });

        return command;
    }

    private static Command CreatePullStatusCommand(IServiceProvider services)
    {
        var applyOption = new Option<bool>(
            name: "--apply",
            description: "Apply changes to plan.yaml",
            getDefaultValue: () => false);

        var command = new Command("pull-status", "Pull status from Trello card positions")
        {
            applyOption
        };

        command.SetHandler(async (bool apply) =>
        {
            var handler = new PullStatusCommand(
                services.GetRequiredService<IYamlParser>(),
                services.GetRequiredService<ITrelloClientWrapper>(),
                services.GetRequiredService<ISyncService>(),
                services.GetRequiredService<PathSettings>());
            await handler.ExecuteAsync(apply);
        }, applyOption);

        return command;
    }
}
