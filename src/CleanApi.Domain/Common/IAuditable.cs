namespace CleanApi.Domain.Common;

public interface IAuditable
{
    string? CreatedBy { get; set; }
    string? UpdatedBy { get; set; }
}
