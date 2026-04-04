using GarAgil.Domain.Workflow;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GarAgil.Application.Workflow;

public class BudgetResult
{
    public string Description { get; set; } = string.Empty;
    public IEnumerable<string> SuggestedParts { get; set; } = new List<string>();
}

public class BudgetingService
{
    private readonly ISmartBudgetingAi _ai;

    public BudgetingService(ISmartBudgetingAi ai)
    {
        _ai = ai;
    }

    public async Task<BudgetResult> CreateBudgetWithSuggestionsAsync(string serviceDescription)
    {
        var suggestions = await _ai.SuggestRelatedPartsAsync(serviceDescription);
        
        return new BudgetResult
        {
            Description = serviceDescription,
            SuggestedParts = suggestions
        };
    }
}
