using CleanApi.Application.Common.Interfaces;
using FluentAssertions;

namespace CleanApi.UnitTests.Common.Models;

public class AuthResultTests
{
    [Fact]
    public void AuthResult_ShouldHaveDefaultValues()
    {
        // Act
        var authResult = new AuthResult();

        // Assert
        authResult.AccessToken.Should().BeEmpty();
        authResult.RefreshToken.Should().BeEmpty();
        authResult.ExpiresAt.Should().Be(default);
    }

    [Fact]
    public void AuthResult_ShouldAcceptValues()
    {
        // Arrange
        var accessToken = "jwt-access-token";
        var refreshToken = "refresh-token";
        var expiresAt = DateTime.UtcNow.AddMinutes(15);

        // Act
        var authResult = new AuthResult
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = expiresAt
        };

        // Assert
        authResult.AccessToken.Should().Be(accessToken);
        authResult.RefreshToken.Should().Be(refreshToken);
        authResult.ExpiresAt.Should().Be(expiresAt);
    }
}
