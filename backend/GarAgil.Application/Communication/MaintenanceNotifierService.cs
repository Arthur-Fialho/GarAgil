using GarAgil.Domain.Communication;
using System;
using System.Threading.Tasks;

namespace GarAgil.Application.Communication;

public class MaintenanceNotifierService
{
    private readonly IPredictiveMaintenanceAi _ai;
    private const int NotificationThresholdDays = 7;

    public MaintenanceNotifierService(IPredictiveMaintenanceAi ai)
    {
        _ai = ai;
    }

    public async Task<WhatsAppNotification?> EvaluateAndNotifyAsync(string vehiclePlate, int currentMileage, string customerPhone)
    {
        var predictedDate = await _ai.PredictNextMaintenanceDateAsync(vehiclePlate, currentMileage);
        
        var daysUntilMaintenance = (predictedDate - DateTime.UtcNow).TotalDays;

        if (daysUntilMaintenance <= NotificationThresholdDays)
        {
            var message = $"Olá! A IA do GarAgil analisou que o veículo {vehiclePlate} precisará de revisão em breve. Que tal agendar?";
            return new WhatsAppNotification(customerPhone, message);
        }

        return null;
    }
}
