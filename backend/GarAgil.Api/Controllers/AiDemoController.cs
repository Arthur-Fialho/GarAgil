using GarAgil.Application.Workflow;
using GarAgil.Application.CRM;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace GarAgil.Api.Controllers;

[ApiController]
[Route("api/ai")]
public class AiDemoController : ControllerBase
{
    private readonly BudgetingService _budgetingService;
    private readonly FeedbackAnalysisService _feedbackAnalysisService;

    public AiDemoController(BudgetingService budgetingService, FeedbackAnalysisService feedbackAnalysisService)
    {
        _budgetingService = budgetingService;
        _feedbackAnalysisService = feedbackAnalysisService;
    }

    // Example 1: Smart Budgeting AI
    [HttpGet("smart-budget")]
    public async Task<IActionResult> GetBudgetSuggestions([FromQuery] string serviceDescription)
    {
        if (string.IsNullOrWhiteSpace(serviceDescription))
            return BadRequest("A descrição do serviço (serviceDescription) é obrigatória.");

        var result = await _budgetingService.CreateBudgetWithSuggestionsAsync(serviceDescription);
        return Ok(result);
    }

    // Example 2: Sentiment Analysis AI
    [HttpGet("sentiment-analysis")]
    public async Task<IActionResult> AnalyzeSentiment([FromQuery] string feedbackText)
    {
        if (string.IsNullOrWhiteSpace(feedbackText))
            return BadRequest("O texto de feedback (feedbackText) é obrigatório.");

        var result = await _feedbackAnalysisService.ProcessFeedbackAsync(feedbackText);
        return Ok(result);
    }
}
