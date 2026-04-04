using System.Collections.Generic;
using System.Threading.Tasks;

namespace GarAgil.Domain.Workflow;

public interface ISmartBudgetingAi
{
    // Receives a service description (e.g., "Troca de correia dentada") 
    // and returns a list of suggested related parts (e.g., "Tensionador", "Bomba d'água").
    Task<IEnumerable<string>> SuggestRelatedPartsAsync(string serviceDescription);
}
