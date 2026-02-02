using TrelloSync.Models;
using YamlDotNet.Serialization;
using YamlDotNet.Serialization.NamingConventions;

namespace TrelloSync.Services;

public class YamlParser : IYamlParser
{
    private readonly IDeserializer _deserializer;
    private readonly ISerializer _serializer;

    public YamlParser()
    {
        _deserializer = new DeserializerBuilder()
            .WithNamingConvention(UnderscoredNamingConvention.Instance)
            .IgnoreUnmatchedProperties()
            .Build();

        _serializer = new SerializerBuilder()
            .WithNamingConvention(UnderscoredNamingConvention.Instance)
            .ConfigureDefaultValuesHandling(DefaultValuesHandling.OmitNull)
            .Build();
    }

    public TaskPlan ParsePlan(string filePath)
    {
        if (!File.Exists(filePath))
        {
            throw new FileNotFoundException($"Plan file not found: {filePath}");
        }

        var yaml = File.ReadAllText(filePath);
        var plan = _deserializer.Deserialize<TaskPlan>(yaml);

        if (plan == null)
        {
            throw new InvalidOperationException($"Failed to parse plan file: {filePath}");
        }

        return plan;
    }

    public void SavePlan(string filePath, TaskPlan plan)
    {
        var yaml = _serializer.Serialize(plan);
        File.WriteAllText(filePath, yaml);
    }
}
