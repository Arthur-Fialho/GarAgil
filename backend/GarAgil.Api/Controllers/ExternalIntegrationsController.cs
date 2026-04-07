using GarAgil.Domain.CRM;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace GarAgil.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ExternalIntegrationsController : ControllerBase
{
    private readonly IExternalDataGateway _externalDataGateway;

    public ExternalIntegrationsController(IExternalDataGateway externalDataGateway)
    {
        _externalDataGateway = externalDataGateway;
    }

    [HttpGet("cep/{cep}")]
    public async Task<IActionResult> GetAddressByCep(string cep)
    {
        var result = await _externalDataGateway.GetAddressByCepAsync(cep);
        
        if (result == null)
            return NotFound(new { message = "CEP não encontrado." });

        return Ok(result);
    }

    [HttpGet("cnpj/{cnpj}")]
    public async Task<IActionResult> GetCompanyByCnpj(string cnpj)
    {
        var result = await _externalDataGateway.GetCompanyByCnpjAsync(cnpj);
        
        if (result == null)
            return NotFound(new { message = "CNPJ não encontrado." });

        return Ok(result);
    }
}
