using DotNetEnv;
using GarAgil.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Text;

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

// Register DbContext with SQLite for local persistence
var dbPath = System.IO.Path.Join(Environment.CurrentDirectory, "garagil.db");
builder.Services.AddDbContext<GarAgilDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

// Register AI Gateway using HttpClient
builder.Services.AddHttpClient<GarAgil.Infrastructure.AI.GeminiGateway>();
builder.Services.AddScoped<GarAgil.Domain.Workflow.ISmartBudgetingAi>(sp => sp.GetRequiredService<GarAgil.Infrastructure.AI.GeminiGateway>());
builder.Services.AddScoped<GarAgil.Domain.CRM.ISentimentAnalysisAi>(sp => sp.GetRequiredService<GarAgil.Infrastructure.AI.GeminiGateway>());
builder.Services.AddScoped<GarAgil.Domain.Communication.IPredictiveMaintenanceAi>(sp => sp.GetRequiredService<GarAgil.Infrastructure.AI.GeminiGateway>());
builder.Services.AddScoped<GarAgil.Domain.CRM.IDocumentOcrAi>(sp => sp.GetRequiredService<GarAgil.Infrastructure.AI.GeminiGateway>());
builder.Services.AddScoped<GarAgil.Domain.Inventory.IInvoiceReaderAi>(sp => sp.GetRequiredService<GarAgil.Infrastructure.AI.GeminiGateway>());

// Register External APIs
builder.Services.AddHttpClient<GarAgil.Domain.CRM.IExternalDataGateway, GarAgil.Infrastructure.Data.BrasilApiGateway>();

// Register Repositories
builder.Services.AddScoped<GarAgil.Domain.CRM.ICustomerRepository, GarAgil.Infrastructure.Data.Repositories.CustomerRepository>();
builder.Services.AddScoped<GarAgil.Domain.Workflow.IServiceOrderRepository, GarAgil.Infrastructure.Data.Repositories.ServiceOrderRepository>();

// Register Application Services
builder.Services.AddScoped<GarAgil.Application.Workflow.BudgetingService>();
builder.Services.AddScoped<GarAgil.Application.CRM.FeedbackAnalysisService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_SECRET_KEY") ?? "fallback_secret_key_for_development_purposes_only"))
        };
    });
builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseMiddleware<GarAgil.Api.Middlewares.GlobalExceptionMiddleware>();

// Automatically apply pending migrations to the SQLite database
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<GarAgilDbContext>();
    if (db.Database.IsRelational())
    {
        db.Database.Migrate();
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program { }
