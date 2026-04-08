using GarAgil.Domain.Financial;
using GarAgil.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace GarAgil.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FinancialController : ControllerBase
{
    private readonly GarAgilDbContext _context;

    public FinancialController(GarAgilDbContext context)
    {
        _context = context;
    }

    // Accounts Payable
    [HttpGet("payables")]
    public async Task<IActionResult> GetPayables()
    {
        var payables = await _context.PayableAccounts.OrderByDescending(p => p.DueDate).ToListAsync();
        return Ok(payables);
    }

    [HttpPost("payables")]
    public async Task<IActionResult> CreatePayable([FromBody] CreateAccountRequest request)
    {
        var account = new PayableAccount(request.Description, request.Amount, request.DueDate);
        _context.PayableAccounts.Add(account);
        await _context.SaveChangesAsync();
        return Ok(account);
    }

    [HttpPost("payables/{id}/pay")]
    public async Task<IActionResult> PayAccount(Guid id)
    {
        var account = await _context.PayableAccounts.FindAsync(id);
        if (account == null) return NotFound();

        account.Pay();
        await _context.SaveChangesAsync();
        return Ok(account);
    }

    // Accounts Receivable
    [HttpGet("receivables")]
    public async Task<IActionResult> GetReceivables()
    {
        var receivables = await _context.ReceivableAccounts.OrderByDescending(r => r.DueDate).ToListAsync();
        return Ok(receivables);
    }

    [HttpPost("receivables")]
    public async Task<IActionResult> CreateReceivable([FromBody] CreateAccountRequest request)
    {
        var account = new ReceivableAccount(request.Description, request.Amount, request.DueDate);
        _context.ReceivableAccounts.Add(account);
        await _context.SaveChangesAsync();
        return Ok(account);
    }

    [HttpPost("receivables/{id}/receive")]
    public async Task<IActionResult> ReceiveAccount(Guid id)
    {
        var account = await _context.ReceivableAccounts.FindAsync(id);
        if (account == null) return NotFound();

        account.Receive();
        await _context.SaveChangesAsync();
        return Ok(account);
    }

    // Summary for Dashboard
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var payables = await _context.PayableAccounts.ToListAsync();
        var receivables = await _context.ReceivableAccounts.ToListAsync();

        var totalPaid = payables.Where(p => p.IsPaid).Sum(p => p.Amount);
        var totalToPay = payables.Where(p => !p.IsPaid).Sum(p => p.Amount);
        
        var totalReceived = receivables.Where(r => r.IsReceived).Sum(r => r.Amount);
        var totalToReceive = receivables.Where(r => !r.IsReceived).Sum(r => r.Amount);

        return Ok(new
        {
            TotalPaid = totalPaid,
            TotalToPay = totalToPay,
            TotalReceived = totalReceived,
            TotalToReceive = totalToReceive,
            Balance = totalReceived - totalPaid,
            ForecastBalance = (totalReceived + totalToReceive) - (totalPaid + totalToPay)
        });
    }
}

public class CreateAccountRequest
{
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime DueDate { get; set; }
}
