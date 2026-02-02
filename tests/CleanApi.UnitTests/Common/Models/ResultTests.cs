using CleanApi.Application.Common.Models;
using FluentAssertions;

namespace CleanApi.UnitTests.Common.Models;

public class ResultTests
{
    [Fact]
    public void Success_ShouldReturnSucceededTrue()
    {
        // Act
        var result = Result.Success();

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public void Failure_WithSingleError_ShouldReturnSucceededFalse()
    {
        // Arrange
        var errorMessage = "Something went wrong";

        // Act
        var result = Result.Failure(errorMessage);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Errors.Should().ContainSingle().Which.Should().Be(errorMessage);
    }

    [Fact]
    public void Failure_WithMultipleErrors_ShouldReturnAllErrors()
    {
        // Arrange
        var errors = new[] { "Error 1", "Error 2", "Error 3" };

        // Act
        var result = Result.Failure(errors);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Errors.Should().BeEquivalentTo(errors);
    }
}

public class ResultOfTTests
{
    [Fact]
    public void Success_WithValue_ShouldReturnValue()
    {
        // Arrange
        var expectedValue = "test value";

        // Act
        var result = Result<string>.Success(expectedValue);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Value.Should().Be(expectedValue);
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public void Failure_AccessingValue_ShouldThrowException()
    {
        // Arrange
        var result = Result<string>.Failure("Error");

        // Act & Assert
        var action = () => { var _ = result.Value; };
        action.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void ValueOrDefault_WhenFailed_ShouldReturnDefault()
    {
        // Arrange
        var result = Result<string>.Failure("Error");

        // Act & Assert
        result.ValueOrDefault.Should().BeNull();
    }

    [Fact]
    public void ImplicitConversion_FromValue_ShouldCreateSuccess()
    {
        // Arrange
        var value = 42;

        // Act
        Result<int> result = value;

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Value.Should().Be(value);
    }
}
