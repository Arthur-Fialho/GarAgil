using System.Threading.Tasks;

namespace GarAgil.Domain.Communication;

/// <summary>
/// Architecture Rule: The backend must not communicate directly with WhatsApp API inside the Domain layer.
/// This interface abstracts the external Meta/Cloud API.
/// </summary>
public interface IWhatsAppGateway
{
    Task<bool> SendMessageAsync(WhatsAppNotification notification);
}
