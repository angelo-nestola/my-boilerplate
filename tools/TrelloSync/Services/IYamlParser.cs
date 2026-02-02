using TrelloSync.Models;

namespace TrelloSync.Services;

public interface IYamlParser
{
    TaskPlan ParsePlan(string filePath);
    void SavePlan(string filePath, TaskPlan plan);
}
