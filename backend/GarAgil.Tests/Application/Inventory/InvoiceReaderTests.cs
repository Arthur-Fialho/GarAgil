using FluentAssertions;
using GarAgil.Application.Inventory;
using GarAgil.Domain.Inventory;
using Moq;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace GarAgil.Tests.Application.Inventory;

public class InvoiceReaderTests
{
    [Fact]
    public async Task ProcessInvoice_WhenParsedByAi_ShouldCalculateMarkupCorrectly()
    {
        // Arrange
        var mockAi = new Mock<IInvoiceReaderAi>();
        var dummyFile = new byte[] { 0x03, 0x04 };
        
        var mockedItems = new List<ParsedInvoiceItem>
        {
            new ParsedInvoiceItem { Description = "Pastilha de Freio", CostPrice = 100.00m }
        };

        mockAi.Setup(ai => ai.ParseInvoiceAsync(dummyFile))
              .ReturnsAsync(mockedItems);

        // Service configured with a 50% Markup rule
        var invoiceService = new SupplierInvoiceService(mockAi.Object, markupPercentage: 50m);

        // Act
        var partsToStock = await invoiceService.ProcessIncomingInvoiceAsync(dummyFile);

        // Assert
        var part = partsToStock.First();
        part.Name.Should().Be("Pastilha de Freio");
        part.CostPrice.Should().Be(100.00m);
        // Cost + 50% Markup = Selling Price
        part.SellingPrice.Should().Be(150.00m); 
    }
}
