using FluentAssertions;
using GarAgil.Application.CRM;
using GarAgil.Domain.CRM;
using Moq;
using System.Threading.Tasks;
using Xunit;

namespace GarAgil.Tests.Application.CRM;

public class SentimentAnalysisTests
{
    [Fact]
    public async Task ProcessFeedback_WhenGivenNegativeReview_ShouldFlagForManagerReview()
    {
        // Arrange
        var mockAi = new Mock<ISentimentAnalysisAi>();
        var feedbackText = "O serviço demorou muito e o carro saiu sujo.";
        
        // Mocking the AI categorization
        mockAi.Setup(ai => ai.AnalyzeFeedbackAsync(feedbackText))
              .ReturnsAsync(Sentiment.Negative);

        var analysisService = new FeedbackAnalysisService(mockAi.Object);

        // Act
        var result = await analysisService.ProcessFeedbackAsync(feedbackText);

        // Assert
        result.Sentiment.Should().Be(Sentiment.Negative);
        result.RequiresManagerAttention.Should().BeTrue();
    }
}
