# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files
COPY CleanApi.sln ./
COPY src/CleanApi.Domain/CleanApi.Domain.csproj src/CleanApi.Domain/
COPY src/CleanApi.Application/CleanApi.Application.csproj src/CleanApi.Application/
COPY src/CleanApi.Infrastructure/CleanApi.Infrastructure.csproj src/CleanApi.Infrastructure/
COPY src/CleanApi.WebApi/CleanApi.WebApi.csproj src/CleanApi.WebApi/

# Restore dependencies
RUN dotnet restore src/CleanApi.WebApi/CleanApi.WebApi.csproj

# Copy source code
COPY src/ src/

# Build and publish
WORKDIR /src/src/CleanApi.WebApi
RUN dotnet publish -c Release -o /app/publish --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Create non-root user for security
RUN adduser --disabled-password --gecos '' appuser

# Copy published files
COPY --from=build /app/publish .

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Expose port
EXPOSE 8080

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl --fail http://localhost:8080/health || exit 1

# Entry point
ENTRYPOINT ["dotnet", "CleanApi.WebApi.dll"]
