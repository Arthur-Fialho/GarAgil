using System.Threading.Tasks;

namespace GarAgil.Domain.CRM;

public class OcrExtractedData
{
    public string Name { get; set; } = string.Empty;
    public string Document { get; set; } = string.Empty;
}

public interface IDocumentOcrAi
{
    // Simulates receiving a base64 image or byte array of a CNH/CRLV 
    // and extracting structured text data.
    Task<OcrExtractedData> ExtractCustomerDataFromImageAsync(byte[] imageBytes);
}
