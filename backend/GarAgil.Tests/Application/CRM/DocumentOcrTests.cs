using FluentAssertions;
using GarAgil.Application.CRM;
using GarAgil.Domain.CRM;
using Moq;
using System;
using System.Threading.Tasks;
using Xunit;

namespace GarAgil.Tests.Application.CRM;

public class DocumentOcrTests
{
    [Fact]
    public async Task RegisterFromCnh_WhenValidImage_ShouldCreateCustomer()
    {
        // Arrange
        var mockAi = new Mock<IDocumentOcrAi>();
        var dummyImage = new byte[] { 0x01, 0x02 }; // Fake image
        
        // Mocking the AI reading the CNH and returning JSON
        mockAi.Setup(ai => ai.ExtractCustomerDataFromImageAsync(dummyImage))
              .ReturnsAsync(new OcrExtractedData { Name = "Maria Oliveira", Document = "987.654.321-00" });

        var customerRegistrationService = new CustomerRegistrationService(mockAi.Object);

        // Act
        var customer = await customerRegistrationService.RegisterFromDocumentImageAsync(dummyImage);

        // Assert
        customer.Should().NotBeNull();
        customer.Name.Should().Be("Maria Oliveira");
        customer.Document.Should().Be("987.654.321-00");
    }
}
