using System.Linq.Expressions;

namespace CleanApi.Application.Common.Interfaces;

public interface IBackgroundJobService
{
    string Enqueue(Expression<Action> methodCall);
    string Enqueue<T>(Expression<Action<T>> methodCall);
    string Schedule(Expression<Action> methodCall, TimeSpan delay);
    string Schedule<T>(Expression<Action<T>> methodCall, TimeSpan delay);
    void AddOrUpdateRecurring(string jobId, Expression<Action> methodCall, string cronExpression);
    void AddOrUpdateRecurring<T>(string jobId, Expression<Action<T>> methodCall, string cronExpression);
    void RemoveRecurring(string jobId);
}
