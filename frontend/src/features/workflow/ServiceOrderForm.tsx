import React, { useState } from 'react';
import Button from '../../components/Button';
import api from '../../services/api';

interface ServiceOrderFormProps {
  onSuccess: () => void;
}

const ServiceOrderForm: React.FC<ServiceOrderFormProps> = ({ onSuccess }) => {
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({ vehiclePlate: '', vehicleModel: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = { vehiclePlate: '', vehicleModel: '', description: '' };
    if (!vehiclePlate) newErrors.vehiclePlate = 'A placa do veículo é obrigatória';
    if (!vehicleModel) newErrors.vehicleModel = 'O modelo do veículo é obrigatório';
    if (!description) newErrors.description = 'A descrição do serviço é obrigatória';
    setErrors(newErrors);

    if (newErrors.vehiclePlate || newErrors.vehicleModel || newErrors.description) {
      return;
    }

    try {
      setIsLoading(true);
      await api.post('/serviceorders', { vehiclePlate, vehicleModel, description });
      setVehiclePlate('');
      setVehicleModel('');
      setDescription('');
      setIsExpanded(false); // Close the form on success
      onSuccess(); // Refresh Kanban board
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova Ordem de Serviço
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
        <h4 className="text-lg font-medium text-gray-800">Registrar Novo Serviço (Veículo)</h4>
        <button 
          onClick={() => setIsExpanded(false)} 
          className="text-gray-400 hover:text-gray-600 focus:outline-none"
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
            <label htmlFor="vehiclePlate" className="block text-sm font-medium text-gray-700">Placa do Veículo</label>
            <input 
              id="vehiclePlate" 
              value={vehiclePlate} 
              onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())} 
              disabled={isLoading}
              placeholder="ABC-1234"
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:ring-primary focus:border-primary border-gray-300 px-3 py-2 border ${errors.vehiclePlate ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
            />
            {errors.vehiclePlate && <p className="mt-1 text-sm text-red-600">{errors.vehiclePlate}</p>}
          </div>
          
          <div className="w-full md:w-1/4">
            <label htmlFor="vehicleModel" className="block text-sm font-medium text-gray-700">Modelo do Veículo</label>
            <input 
              id="vehicleModel" 
              value={vehicleModel} 
              onChange={(e) => setVehicleModel(e.target.value)} 
              disabled={isLoading}
              placeholder="Ex: Honda Civic"
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:ring-primary focus:border-primary border-gray-300 px-3 py-2 border ${errors.vehicleModel ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
            />
            {errors.vehicleModel && <p className="mt-1 text-sm text-red-600">{errors.vehicleModel}</p>}
          </div>
          
          <div className="w-full md:w-2/4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição do Serviço</label>
            <input 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              disabled={isLoading}
              placeholder="Ex: Troca de óleo e filtro"
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:ring-primary focus:border-primary border-gray-300 px-3 py-2 border ${errors.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>
        </div>
        
        <div className="pt-2 flex justify-end gap-2">
          <Button type="button" onClick={() => setIsExpanded(false)} variant="secondary">
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar Ordem'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ServiceOrderForm;
