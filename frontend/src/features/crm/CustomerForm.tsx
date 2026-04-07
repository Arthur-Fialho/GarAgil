import React, { useState } from 'react';
import Button from '../../components/Button';
import api from '../../services/api';

const CustomerForm: React.FC = () => {
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  
  const [errors, setErrors] = useState({ name: '', document: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);

  // New states for Vehicle linking
  const [createdCustomerId, setCreatedCustomerId] = useState<string | null>(null);
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');

  const fetchCepData = async (searchCep: string) => {
    const cleanCep = searchCep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    
    setIsFetchingData(true);
    try {
      const response = await api.get(`/externalintegrations/cep/${cleanCep}`);
      const data = response.data;
      setStreet(data.street || '');
      setNeighborhood(data.neighborhood || '');
      setCity(data.city || '');
      setState(data.state || '');
      window.document.getElementById('number')?.focus();
    } catch (err) {
      console.error('Erro ao buscar CEP', err);
    } finally {
      setIsFetchingData(false);
    }
  };

  const fetchCnpjData = async (searchCnpj: string) => {
    const cleanCnpj = searchCnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) return;
    
    setIsFetchingData(true);
    try {
      const response = await api.get(`/externalintegrations/cnpj/${cleanCnpj}`);
      const data = response.data;
      setName(data.tradeName || data.legalName || '');
      
      if (data.address) {
        setCep(data.address.cep || '');
        setStreet(data.address.street || '');
        setNumber(data.address.number || '');
        setNeighborhood(data.address.neighborhood || '');
        setCity(data.address.city || '');
        setState(data.address.state || '');
      }
    } catch (err) {
      console.error('Erro ao buscar CNPJ', err);
    } finally {
      setIsFetchingData(false);
    }
  };

  const handleDocumentBlur = () => {
    if (document.length >= 14) {
      fetchCnpjData(document);
    }
  };

  const handleCepBlur = () => {
    if (cep.length >= 8) {
      fetchCepData(cep);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    const newErrors = { name: '', document: '' };
    if (!name) newErrors.name = 'O nome é obrigatório';
    if (!document) newErrors.document = 'Documento inválido';
    setErrors(newErrors);

    if (newErrors.name || newErrors.document) {
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.post('/customers', { name, document, email: '', phone, cep, street, number, neighborhood, city, state });
      setSuccessMsg('Cliente cadastrado com sucesso! Agora você pode vincular veículos.');
      setCreatedCustomerId(res.data.id);
    } catch (error) {
      console.error('Erro ao cadastrar cliente', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehiclePlate || !vehicleModel || !createdCustomerId) return;
    try {
      setIsLoading(true);
      await api.post(`/customers/${createdCustomerId}/vehicles`, { plate: vehiclePlate, model: vehicleModel });
      setSuccessMsg('Veículo vinculado com sucesso!');
      setVehiclePlate('');
      setVehicleModel('');
    } catch (error) {
      console.error('Erro ao vincular veículo', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetForm = () => {
    setCreatedCustomerId(null);
    setName('');
    setDocument('');
    setPhone('');
    setCep('');
    setStreet('');
    setNumber('');
    setNeighborhood('');
    setCity('');
    setState('');
    setSuccessMsg('');
    setVehiclePlate('');
    setVehicleModel('');
  };

  return (
    <div className="space-y-6 relative">
      {isFetchingData && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      
      {successMsg && (
        <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-md flex justify-between items-center">
          <span>{successMsg}</span>
          {createdCustomerId && (
            <button onClick={handleResetForm} className="text-sm font-semibold hover:underline">
              Cadastrar Novo Cliente
            </button>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={`space-y-4 ${createdCustomerId ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="document" className="block text-sm font-medium text-gray-700">CPF ou CNPJ</label>
            <input 
              id="document" 
              value={document} 
              onChange={(e) => setDocument(e.target.value)} 
              onBlur={handleDocumentBlur}
              disabled={isLoading || !!createdCustomerId}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:ring-primary focus:border-primary border-gray-300 px-3 py-2 border ${errors.document ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
            />
            {errors.document && <p className="mt-1 text-sm text-red-600">{errors.document}</p>}
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo / Fantasia</label>
            <input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              disabled={isLoading || !!createdCustomerId}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:ring-primary focus:border-primary border-gray-300 px-3 py-2 border ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone / Contato</label>
            <input 
              id="phone" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              disabled={isLoading || !!createdCustomerId}
              placeholder="(00) 00000-0000"
              className="mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:ring-primary focus:border-primary border-gray-300 px-3 py-2 border"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="cep" className="block text-sm font-medium text-gray-700">CEP</label>
            <input 
              id="cep" 
              value={cep} 
              onChange={(e) => setCep(e.target.value)} 
              onBlur={handleCepBlur}
              disabled={isLoading || !!createdCustomerId}
              className="mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:ring-primary focus:border-primary border-gray-300 px-3 py-2 border"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="street" className="block text-sm font-medium text-gray-700">Rua / Logradouro</label>
            <input 
              id="street" 
              value={street} 
              onChange={(e) => setStreet(e.target.value)} 
              disabled={isLoading || !!createdCustomerId}
              className="mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:ring-primary focus:border-primary border-gray-300 px-3 py-2 border"
            />
          </div>
          <div>
            <label htmlFor="number" className="block text-sm font-medium text-gray-700">Número</label>
            <input 
              id="number" 
              value={number} 
              onChange={(e) => setNumber(e.target.value)} 
              disabled={isLoading || !!createdCustomerId}
              className="mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:ring-primary focus:border-primary border-gray-300 px-3 py-2 border"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700">Bairro</label>
            <input 
              id="neighborhood" 
              value={neighborhood} 
              onChange={(e) => setNeighborhood(e.target.value)} 
              disabled={isLoading || !!createdCustomerId}
              className="mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:ring-primary focus:border-primary border-gray-300 px-3 py-2 border"
            />
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">Cidade</label>
            <input 
              id="city" 
              value={city} 
              onChange={(e) => setCity(e.target.value)} 
              disabled={isLoading || !!createdCustomerId}
              className="mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:ring-primary focus:border-primary border-gray-300 px-3 py-2 border"
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">UF</label>
            <input 
              id="state" 
              value={state} 
              onChange={(e) => setState(e.target.value)} 
              disabled={isLoading || !!createdCustomerId}
              className="mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:ring-primary focus:border-primary border-gray-300 px-3 py-2 border"
            />
          </div>
        </div>
        
        {!createdCustomerId && (
          <div className="pt-2">
            <Button type="submit" disabled={isLoading || isFetchingData} className="w-full sm:w-auto">
              {isLoading ? 'Aguarde...' : 'Cadastrar Cliente'}
            </Button>
          </div>
        )}
      </form>

      {createdCustomerId && (
        <form onSubmit={handleAddVehicle} className="mt-6 border-t border-gray-200 pt-6">
          <h4 className="text-lg font-medium text-gray-800 mb-4">Vincular Veículo a este Cliente</h4>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-1/3">
              <label htmlFor="vehiclePlate" className="block text-sm font-medium text-gray-700">Placa do Veículo</label>
              <input 
                id="vehiclePlate" 
                value={vehiclePlate} 
                onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())} 
                disabled={isLoading}
                placeholder="ABC-1234"
                className="mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:ring-primary focus:border-primary border-gray-300 px-3 py-2 border"
                required
              />
            </div>
            <div className="w-full md:w-1/3">
              <label htmlFor="vehicleModel" className="block text-sm font-medium text-gray-700">Modelo</label>
              <input 
                id="vehicleModel" 
                value={vehicleModel} 
                onChange={(e) => setVehicleModel(e.target.value)} 
                disabled={isLoading}
                placeholder="Ex: Honda Civic"
                className="mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:ring-primary focus:border-primary border-gray-300 px-3 py-2 border"
                required
              />
            </div>
            <div className="w-full md:w-1/3">
              <Button type="submit" disabled={isLoading} variant="success" className="w-full">
                {isLoading ? 'Adicionando...' : 'Adicionar Veículo'}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default CustomerForm;
