using FluentAssertions;
using GarAgil.Application.Workflow;
using GarAgil.Domain.Workflow;
using Moq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace GarAgil.Tests.Application.Workflow;

public class SmartBudgetingTests
{
    [Fact]
    public async Task GenerateBudget_WhenGivenService_ShouldAppendAiSuggestions()
    {
        // Arrange
        var mockAi = new Mock<ISmartBudgetingAi>();
        var serviceDescription = "Troca de correia dentada do Palio";
        
        // Mocking the AI response: zero cost, deterministic!
        mockAi.Setup(ai => ai.SuggestRelatedPartsAsync(serviceDescription))
              .ReturnsAsync(new List<string> { "Tensionador", "Bomba d'água" });

        var budgetService = new BudgetingService(mockAi.Object);

        // Act
        var result = await budgetService.CreateBudgetWithSuggestionsAsync(serviceDescription);

        // Assert
        result.Description.Should().Be(serviceDescription);
        result.SuggestedParts.Should().Contain("Tensionador");
        result.SuggestedParts.Should().Contain("Bomba d'água");
        
        // Verify the AI was actually called exactly once
        mockAi.Verify(ai => ai.SuggestRelatedPartsAsync(serviceDescription), Times.Once);
    }
}
