import React, { useState } from 'react';
import Button from '../../components/Button';
import api from '../../services/api';

interface ServiceOrderFormProps {
  onSuccess: () => void;
}

const ServiceOrderForm: React.FC<ServiceOrderFormProps> = ({ onSuccess }) => {
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [currentDescription, setCurrentDescription] = useState('');
  
  const [errors, setErrors] = useState({ vehiclePlate: '', vehicleModel: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const addDescription = () => {
    if (!currentDescription.trim()) return;
    setDescriptions([...descriptions, currentDescription.trim()]);
    setCurrentDescription('');
  };

  const removeDescription = (index: number) => {
    setDescriptions(descriptions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalDescriptions = [...descriptions];
    if (currentDescription.trim()) {
      finalDescriptions.push(currentDescription.trim());
    }

    const newErrors = { vehiclePlate: '', vehicleModel: '', description: '' };
    if (!vehiclePlate) newErrors.vehiclePlate = 'A placa do veículo é obrigatória';
    if (!vehicleModel) newErrors.vehicleModel = 'O modelo do veículo é obrigatório';
    if (finalDescriptions.length === 0) newErrors.description = 'Adicione ao menos um serviço';
    setErrors(newErrors);

    if (newErrors.vehiclePlate || newErrors.vehicleModel || newErrors.description) {
      return;
    }

    try {
      setIsLoading(true);
      await api.post('/serviceorders', { 
        vehiclePlate, 
        vehicleModel, 
        descriptions: finalDescriptions 
      });
      setVehiclePlate('');
      setVehicleModel('');
      setDescriptions([]);
      setCurrentDescription('');
      setIsExpanded(false); 
      onSuccess(); 
    } catch (error) {
      console.error('Erro ao criar ordem de serviço', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isExpanded) {
    return (
      <div className="mb-6 flex justify-end">
        <Button onClick={() => setIsExpanded(true)} variant="primary">
          <svg className="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Nova Ordem de Serviço
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-white p-4 border border-gray-200 rounded-lg shadow-sm animate-in slide-in-from-top-2 duration-200">
      <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
        <h4 className="text-lg font-medium text-gray-800">Registrar Novo Serviço (Veículo)</h4>
        <button 
          onClick={() => setIsExpanded(false)} 
          className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
          title="Fechar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/4">
            <label htmlFor="vehiclePlate" className="block text-sm font-medium text-gray-700 font-bold mb-1 uppercase tracking-wider">Placa</label>
            <input 
              id="vehiclePlate" 
              value={vehiclePlate} 
              onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())} 
              disabled={isLoading}
              placeholder="ABC-1234"
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:ring-primary focus:border-primary border-gray-300 px-3 py-2 border ${errors.vehiclePlate ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
            />
            {errors.vehiclePlate && <p className="mt-1 text-[10px] text-red-600 font-bold">{errors.vehiclePlate}</p>}
          </div>
          
          <div className="w-full md:w-1/4">
            <label htmlFor="vehicleModel" className="block text-sm font-medium text-gray-700 font-bold mb-1 uppercase tracking-wider">Modelo</label>
            <input 
              id="vehicleModel" 
              value={vehicleModel} 
              onChange={(e) => setVehicleModel(e.target.value)} 
              disabled={isLoading}
              placeholder="Ex: Honda Civic"
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:ring-primary focus:border-primary border-gray-300 px-3 py-2 border ${errors.vehicleModel ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
            />
            {errors.vehicleModel && <p className="mt-1 text-[10px] text-red-600 font-bold">{errors.vehicleModel}</p>}
          </div>
          
          <div className="w-full md:w-2/4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 font-bold mb-1 uppercase tracking-wider text-primary">Serviços a Realizar</label>
            <div className="flex gap-2">
              <input 
                id="description" 
                value={currentDescription} 
                onChange={(e) => setCurrentDescription(e.target.value)} 
                disabled={isLoading}
                placeholder="Digite um serviço e aperte Enter..."
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:ring-primary focus:border-primary border-gray-300 px-3 py-2 border ${errors.description && descriptions.length === 0 ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDescription(); } }}
              />
              <button 
                type="button" 
                onClick={addDescription}
                className="mt-1 p-2 bg-blue-50 text-primary border border-blue-100 rounded-md hover:bg-blue-100 transition-colors shadow-sm"
                title="Adicionar serviço à lista"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              </button>
            </div>
            {errors.description && descriptions.length === 0 && <p className="mt-1 text-[10px] text-red-600 font-bold">{errors.description}</p>}
            
            {/* List of added descriptions */}
            {descriptions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 animate-in fade-in duration-300">
                {descriptions.map((desc, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-md text-xs font-bold border border-blue-100 shadow-sm transition-all hover:bg-blue-100">
                    {desc}
                    <button type="button" onClick={() => removeDescription(idx)} className="text-blue-400 hover:text-red-500 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="pt-2 flex justify-end gap-2 border-t border-gray-50 mt-4 pt-4">
          <Button type="button" onClick={() => setIsExpanded(false)} variant="secondary">
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading} className="shadow-md">
            {isLoading ? 'Salvando...' : 'Salvar Ordem de Serviço'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ServiceOrderForm;
