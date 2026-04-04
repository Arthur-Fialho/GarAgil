using System;
using System.Threading.Tasks;

namespace GarAgil.Domain.Communication;

public interface IPredictiveMaintenanceAi
{
    // Simulates an AI predicting the next maintenance date 
    // based on vehicle history, model, and mileage.
    Task<DateTime> PredictNextMaintenanceDateAsync(string vehiclePlate, int currentMileage);
}
