using DotNetEnv;
using GarAgil.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;

// Automatically find and load the .env file
Env.TraversePath().Load();

var builder = WebApplication.CreateBuilder(args);

// Load the connection string from Environment Variable (loaded by DotNetEnv)
var connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");

if (string.IsNullOrEmpty(connectionString))
{
    // Fallback specifically for EF Core tools (like dotnet ef migrations) if run from a directory where .env is not traversed
    connectionString = "Host=localhost;Database=GarAgilDb;Username=postgres;Password=SuperSecretPassword123!";
}

// Register DbContext with PostgreSQL
builder.Services.AddDbContext<GarAgilDbContext>(options =>
    options.UseNpgsql(connectionString));

// Register AI Gateway using HttpClient
builder.Services.AddHttpClient<GarAgil.Infrastructure.AI.GeminiGateway>();
builder.Services.AddScoped<GarAgil.Domain.Workflow.ISmartBudgetingAi>(sp => sp.GetRequiredService<GarAgil.Infrastructure.AI.GeminiGateway>());
builder.Services.AddScoped<GarAgil.Domain.CRM.ISentimentAnalysisAi>(sp => sp.GetRequiredService<GarAgil.Infrastructure.AI.GeminiGateway>());
builder.Services.AddScoped<GarAgil.Domain.Communication.IPredictiveMaintenanceAi>(sp => sp.GetRequiredService<GarAgil.Infrastructure.AI.GeminiGateway>());
builder.Services.AddScoped<GarAgil.Domain.CRM.IDocumentOcrAi>(sp => sp.GetRequiredService<GarAgil.Infrastructure.AI.GeminiGateway>());
builder.Services.AddScoped<GarAgil.Domain.Inventory.IInvoiceReaderAi>(sp => sp.GetRequiredService<GarAgil.Infrastructure.AI.GeminiGateway>());

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();

public partial class Program { }
