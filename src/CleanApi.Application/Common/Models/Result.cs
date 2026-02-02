namespace CleanApi.Application.Common.Models;

/// <summary>
/// Represents the result of an operation that can succeed or fail.
/// Use this pattern to handle errors without throwing exceptions.
/// </summary>
public class Result
{
    protected Result(bool succeeded, IEnumerable<string> errors)
    {
        Succeeded = succeeded;
        Errors = errors.ToArray();
    }

    public bool Succeeded { get; }
    public string[] Errors { get; }

    public static Result Success() => new(true, Array.Empty<string>());

    public static Result Failure(IEnumerable<string> errors) => new(false, errors);

    public static Result Failure(string error) => new(false, new[] { error });
}

/// <summary>
/// Represents the result of an operation that returns a value.
/// </summary>
/// <typeparam name="T">The type of the value returned on success.</typeparam>
public class Result<T> : Result
{
    private readonly T? _value;

    protected Result(T? value, bool succeeded, IEnumerable<string> errors)
        : base(succeeded, errors)
    {
        _value = value;
    }

    /// <summary>
    /// Gets the value if the operation succeeded.
    /// Throws InvalidOperationException if the operation failed.
    /// </summary>
    public T Value => Succeeded
        ? _value!
        : throw new InvalidOperationException("Cannot access Value when operation failed. Check Succeeded first.");

    /// <summary>
    /// Gets the value or default if the operation failed.
    /// </summary>
    public T? ValueOrDefault => _value;

    public static Result<T> Success(T value) => new(value, true, Array.Empty<string>());

    public new static Result<T> Failure(IEnumerable<string> errors) => new(default, false, errors);

    public new static Result<T> Failure(string error) => new(default, false, new[] { error });

    /// <summary>
    /// Implicitly converts a value to a successful Result.
    /// </summary>
    public static implicit operator Result<T>(T value) => Success(value);
}
