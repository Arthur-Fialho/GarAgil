using GarAgil.Domain.CRM;
using System.Threading.Tasks;

namespace GarAgil.Application.CRM;

public class FeedbackAnalysisResult
{
    public Sentiment Sentiment { get; set; }
    public bool RequiresManagerAttention { get; set; }
}

public class FeedbackAnalysisService
{
    private readonly ISentimentAnalysisAi _ai;

    public FeedbackAnalysisService(ISentimentAnalysisAi ai)
    {
        _ai = ai;
    }

    public async Task<FeedbackAnalysisResult> ProcessFeedbackAsync(string feedbackText)
    {
        var sentiment = await _ai.AnalyzeFeedbackAsync(feedbackText);

        return new FeedbackAnalysisResult
        {
            Sentiment = sentiment,
            RequiresManagerAttention = sentiment == Sentiment.Negative
        };
    }
}
