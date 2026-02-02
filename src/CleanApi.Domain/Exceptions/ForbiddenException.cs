namespace CleanApi.Domain.Exceptions;

public class ForbiddenException : Exception
{
    public ForbiddenException() : base("Access to this resource is forbidden.") { }

    public ForbiddenException(string message) : base(message) { }

    public ForbiddenException(string message, Exception innerException)
        : base(message, innerException) { }
}
