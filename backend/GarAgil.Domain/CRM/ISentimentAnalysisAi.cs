using System.Threading.Tasks;

namespace GarAgil.Domain.CRM;

public enum Sentiment
{
    Positive,
    Neutral,
    Negative
}

public interface ISentimentAnalysisAi
{
    // Evaluates a block of text (e.g., a customer review) and returns a sentiment category
    Task<Sentiment> AnalyzeFeedbackAsync(string feedbackText);
}
