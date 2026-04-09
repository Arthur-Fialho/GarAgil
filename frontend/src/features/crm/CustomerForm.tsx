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
  const [customerVehicles, setCustomerVehicles] = useState<{id: string, plate: string, model: string}[]>([]);

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
      setCustomerVehicles(res.data.vehicles || []);
    } catch (error) {
      console.error('Erro ao cadastrar cliente', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehiclePlate || !vehicleModel || !createdCustomerId) return;

    const plateRegex = /^[A-Z]{3}[0-9]{1}[A-Z0-9]{1}[0-9]{2}$/;
    const oldPlateRegex = /^[A-Z]{3}[0-9]{4}$/;
    const cleanPlate = vehiclePlate.replace(/-/g, '').toUpperCase();

    if (!plateRegex.test(cleanPlate) && !oldPlateRegex.test(cleanPlate)) {
      alert('Placa inválida. Use o formato AAA1234 ou AAA1A23.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post(`/customers/${createdCustomerId}/vehicles`, { plate: cleanPlate, model: vehicleModel });
      setSuccessMsg('Veículo vinculado com sucesso!');
      setCustomerVehicles(response.data.vehicles || []);
      setVehiclePlate('');
      setVehicleModel('');
    } catch (error) {
      console.error('Erro ao vincular veículo', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveVehicle = async (vehicleId: string) => {
    try {
      setIsLoading(true);
      const response = await api.delete(`/customers/${createdCustomerId}/vehicles/${vehicleId}`);
      setCustomerVehicles(response.data.vehicles || []);
    } catch (error) {
      console.error('Erro ao remover veículo', error);
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
    setCustomerVehicles([]);
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
        <div className="mt-6 border-t border-gray-200 pt-6">
          <form onSubmit={handleAddVehicle} className="mb-6">
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
                  className="mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:ring-primary focus:border-primary border-gray-300 px-3 py-2 border uppercase font-mono font-bold"
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

          {customerVehicles.length > 0 && (
            <div className="mt-4 animate-in fade-in">
              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Veículos Vinculados</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {customerVehicles.map(v => (
                  <div key={v.id} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-bold text-gray-900 uppercase tracking-wider">{v.plate}</div>
                      <div className="text-xs text-gray-500">{v.model}</div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleRemoveVehicle(v.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Remover Veículo"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerForm;
