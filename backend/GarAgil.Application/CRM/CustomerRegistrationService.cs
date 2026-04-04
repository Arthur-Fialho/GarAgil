using GarAgil.Domain.CRM;
using System.Threading.Tasks;

namespace GarAgil.Application.CRM;

public class CustomerRegistrationService
{
    private readonly IDocumentOcrAi _ai;

    public CustomerRegistrationService(IDocumentOcrAi ai)
    {
        _ai = ai;
    }

    public async Task<Customer> RegisterFromDocumentImageAsync(byte[] imageBytes)
    {
        // AI processes the image and returns JSON structured data
        var extractedData = await _ai.ExtractCustomerDataFromImageAsync(imageBytes);

        // Uses the data to initialize the Domain Entity
        return new Customer(
            name: extractedData.Name, 
            document: extractedData.Document, 
            email: "email@nao-informado.com", // Stub email for OCR scan
            phone: "(00) 00000-0000" // Stub phone for OCR scan
        );
    }
}
