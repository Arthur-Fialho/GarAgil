FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["GarAgil.Api/GarAgil.Api.csproj", "GarAgil.Api/"]
COPY ["GarAgil.Application/GarAgil.Application.csproj", "GarAgil.Application/"]
COPY ["GarAgil.Domain/GarAgil.Domain.csproj", "GarAgil.Domain/"]
COPY ["GarAgil.Infrastructure/GarAgil.Infrastructure.csproj", "GarAgil.Infrastructure/"]
RUN dotnet restore "GarAgil.Api/GarAgil.Api.csproj"

# Copy everything else and build app
COPY . .
WORKDIR "/src/GarAgil.Api"
RUN dotnet build "GarAgil.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "GarAgil.Api.csproj" -c Release -o /app/publish

# Final stage/image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

ENV ASPNETCORE_URLS=http://+:5251
ENV ASPNETCORE_ENVIRONMENT=Development
EXPOSE 5251

ENTRYPOINT ["dotnet", "GarAgil.Api.dll"]
