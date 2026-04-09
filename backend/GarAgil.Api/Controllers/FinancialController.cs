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
    public async Task<IActionResult> GetPayables([FromQuery] DateTime? start, [FromQuery] DateTime? end)
    {
        var query = _context.PayableAccounts.AsQueryable();
        
        if (start.HasValue)
            query = query.Where(p => p.DueDate >= start.Value.Date);
        if (end.HasValue)
            query = query.Where(p => p.DueDate <= end.Value.Date.AddDays(1).AddTicks(-1));

        var payables = await query.OrderByDescending(p => p.DueDate).ToListAsync();
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

    [HttpPut("payables/{id}")]
    public async Task<IActionResult> UpdatePayable(Guid id, [FromBody] CreateAccountRequest request)
    {
        var account = await _context.PayableAccounts.FindAsync(id);
        if (account == null) return NotFound();

        try
        {
            account.Update(request.Description, request.Amount, request.DueDate);
            await _context.SaveChangesAsync();
            return Ok(account);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("payables/{id}/pay")]
    public async Task<IActionResult> PayAccount(Guid id)
    {
        var account = await _context.PayableAccounts.FindAsync(id);
        if (account == null) return NotFound();

        try
        {
            account.Pay();
            await _context.SaveChangesAsync();
            return Ok(account);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("payables/{id}/undo-pay")]
    public async Task<IActionResult> UndoPayAccount(Guid id)
    {
        var account = await _context.PayableAccounts.FindAsync(id);
        if (account == null) return NotFound();

        try
        {
            account.UndoPayment();
            await _context.SaveChangesAsync();
            return Ok(account);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // Accounts Receivable
    [HttpGet("receivables")]
    public async Task<IActionResult> GetReceivables([FromQuery] DateTime? start, [FromQuery] DateTime? end)
    {
        var query = _context.ReceivableAccounts.AsQueryable();

        if (start.HasValue)
            query = query.Where(p => p.DueDate >= start.Value.Date);
        if (end.HasValue)
            query = query.Where(p => p.DueDate <= end.Value.Date.AddDays(1).AddTicks(-1));

        var receivables = await query.OrderByDescending(r => r.DueDate).ToListAsync();
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

    [HttpPut("receivables/{id}")]
    public async Task<IActionResult> UpdateReceivable(Guid id, [FromBody] CreateAccountRequest request)
    {
        var account = await _context.ReceivableAccounts.FindAsync(id);
        if (account == null) return NotFound();

        try
        {
            account.Update(request.Description, request.Amount, request.DueDate);
            await _context.SaveChangesAsync();
            return Ok(account);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("receivables/{id}/receive")]
    public async Task<IActionResult> ReceiveAccount(Guid id)
    {
        var account = await _context.ReceivableAccounts.FindAsync(id);
        if (account == null) return NotFound();

        try
        {
            account.Receive();
            await _context.SaveChangesAsync();
            return Ok(account);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("receivables/{id}/undo-receive")]
    public async Task<IActionResult> UndoReceiveAccount(Guid id)
    {
        var account = await _context.ReceivableAccounts.FindAsync(id);
        if (account == null) return NotFound();

        try
        {
            account.UndoReceive();
            await _context.SaveChangesAsync();
            return Ok(account);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // Summary for Dashboard
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary([FromQuery] DateTime? start, [FromQuery] DateTime? end)
    {
        var payablesQuery = _context.PayableAccounts.AsQueryable();
        var receivablesQuery = _context.ReceivableAccounts.AsQueryable();

        if (start.HasValue)
        {
            payablesQuery = payablesQuery.Where(p => p.DueDate >= start.Value.Date);
            receivablesQuery = receivablesQuery.Where(p => p.DueDate >= start.Value.Date);
        }
        
        if (end.HasValue)
        {
            payablesQuery = payablesQuery.Where(p => p.DueDate <= end.Value.Date.AddDays(1).AddTicks(-1));
            receivablesQuery = receivablesQuery.Where(p => p.DueDate <= end.Value.Date.AddDays(1).AddTicks(-1));
        }

        var payables = await payablesQuery.ToListAsync();
        var receivables = await receivablesQuery.ToListAsync();

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