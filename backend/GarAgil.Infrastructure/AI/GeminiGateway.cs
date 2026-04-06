using GarAgil.Domain.CRM;
using GarAgil.Domain.Workflow;
using GarAgil.Domain.Inventory;
using GarAgil.Domain.Communication;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace GarAgil.Infrastructure.AI;

public class GeminiGateway : 
    ISmartBudgetingAi, 
    ISentimentAnalysisAi, 
    IPredictiveMaintenanceAi, 
    IDocumentOcrAi, 
    IInvoiceReaderAi
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private const string ModelUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    public GeminiGateway(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        var key = config["GEMINI_API_KEY"];
        _apiKey = string.IsNullOrEmpty(key) ? "mock_key_for_testing" : key;
    }

    private async Task<string> CallGeminiAsync(object requestPayload)
    {
        var url = $"{ModelUrl}?key={_apiKey}";
        var jsonPayload = JsonSerializer.Serialize(requestPayload, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync(url, content);
        
        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new Exception($"Gemini API Error: {response.StatusCode} - {error}");
        }

        var responseJson = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(responseJson);
        var resultText = doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text").GetString();

        return resultText ?? string.Empty;
    }

    public async Task<IEnumerable<string>> SuggestRelatedPartsAsync(string serviceDescription)
    {
        var prompt = $"Como mecânico especialista, se o serviço for '{serviceDescription}', quais outras 3 peças comumente precisam ser trocadas junto? Retorne APENAS um array JSON de strings com os nomes das peças, sem formatação markdown.";
        
        var payload = new
        {
            contents = new[] { new { parts = new[] { new { text = prompt } } } },
            generationConfig = new { responseMimeType = "application/json" }
        };

        var json = await CallGeminiAsync(payload);
        return JsonSerializer.Deserialize<List<string>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<string>();
    }

    public async Task<Sentiment> AnalyzeFeedbackAsync(string feedbackText)
    {
        var prompt = $"Analise o sentimento deste feedback de oficina mecânica: '{feedbackText}'. Retorne APENAS um JSON com uma propriedade 'sentiment' contendo 'Positive', 'Neutral' ou 'Negative'.";
        
        var payload = new
        {
            contents = new[] { new { parts = new[] { new { text = prompt } } } },
            generationConfig = new { responseMimeType = "application/json" }
        };

        var json = await CallGeminiAsync(payload);
        var result = JsonSerializer.Deserialize<JsonElement>(json);
        var sentimentStr = result.GetProperty("sentiment").GetString();
        return Enum.Parse<Sentiment>(sentimentStr ?? "Neutral", ignoreCase: true);
    }

    public async Task<DateTime> PredictNextMaintenanceDateAsync(string vehiclePlate, int currentMileage)
    {
        var prompt = $"Veículo placa {vehiclePlate} está com {currentMileage} km. Estime a data da próxima manutenção preventiva (aprox. 10.000km ou 6 meses a partir de hoje). Hoje é {DateTime.UtcNow:yyyy-MM-dd}. Retorne APENAS um JSON com uma propriedade 'nextMaintenanceDate' em formato ISO8601.";
        
        var payload = new
        {
            contents = new[] { new { parts = new[] { new { text = prompt } } } },
            generationConfig = new { responseMimeType = "application/json" }
        };

        var json = await CallGeminiAsync(payload);
        var result = JsonSerializer.Deserialize<JsonElement>(json);
        var dateStr = result.GetProperty("nextMaintenanceDate").GetString();
        return DateTime.Parse(dateStr ?? DateTime.UtcNow.AddMonths(6).ToString("O"));
    }

    public async Task<OcrExtractedData> ExtractCustomerDataFromImageAsync(byte[] imageBytes)
    {
        var base64Image = Convert.ToBase64String(imageBytes);
        var prompt = "Extraia o Nome e o Documento (CPF/CNPJ) deste documento de identidade (CNH/CRLV). Retorne APENAS um JSON com as propriedades 'name' e 'document'.";

        var payload = new
        {
            contents = new[]
            {
                new
                {
                    parts = new object[]
                    {
                        new { text = prompt },
                        new { inlineData = new { mimeType = "image/jpeg", data = base64Image } }
                    }
                }
            },
            generationConfig = new { responseMimeType = "application/json" }
        };

        var json = await CallGeminiAsync(payload);
        var result = JsonSerializer.Deserialize<JsonElement>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        return new OcrExtractedData
        {
            Name = result.TryGetProperty("name", out var n) ? n.GetString() ?? string.Empty : string.Empty,
            Document = result.TryGetProperty("document", out var d) ? d.GetString() ?? string.Empty : string.Empty
        };
    }

    public async Task<IEnumerable<ParsedInvoiceItem>> ParseInvoiceAsync(byte[] fileBytes)
    {
        var base64Pdf = Convert.ToBase64String(fileBytes);
        var prompt = "Leia os itens desta nota fiscal de autopeças. Retorne APENAS um array JSON onde cada objeto tenha 'description' (string) e 'costPrice' (decimal, valor numérico do custo).";

        var payload = new
        {
            contents = new[]
            {
                new
                {
                    parts = new object[]
                    {
                        new { text = prompt },
                        new { inlineData = new { mimeType = "application/pdf", data = base64Pdf } }
                    }
                }
            },
            generationConfig = new { responseMimeType = "application/json" }
        };

        var json = await CallGeminiAsync(payload);
        return JsonSerializer.Deserialize<List<ParsedInvoiceItem>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<ParsedInvoiceItem>();
    }
}
