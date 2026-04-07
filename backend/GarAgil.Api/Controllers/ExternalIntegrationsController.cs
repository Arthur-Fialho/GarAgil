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
        try
        {
            var result = await _externalDataGateway.GetAddressByCepAsync(cep);
            
            if (result == null)
                return NotFound(new { message = "CEP não encontrado." });

            return Ok(result);
        }
        catch (System.Exception ex) when (ex.Message.Contains("Rate limit"))
        {
            return StatusCode(429, new { message = ex.Message });
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("cnpj/{cnpj}")]
    public async Task<IActionResult> GetCompanyByCnpj(string cnpj)
    {
        try
        {
            var result = await _externalDataGateway.GetCompanyByCnpjAsync(cnpj);
            
            if (result == null)
                return NotFound(new { message = "CNPJ não encontrado." });

            return Ok(result);
        }
        catch (System.Exception ex) when (ex.Message.Contains("Rate limit"))
        {
            return StatusCode(429, new { message = ex.Message });
        }
        catch (System.Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
