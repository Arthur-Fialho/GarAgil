import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Button from '../../components/Button';

interface Vehicle {
  id: string;
  plate: string;
  model: string;
}

interface Customer {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  vehicles: Vehicle[];
}

const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<{customerId: string, vehicle: Vehicle} | null>(null);
  const [addVehicleTo, setAddVehicleTo] = useState<Customer | null>(null);
  
  // New Vehicle form state
  const [newVehicle, setNewVehicle] = useState({ plate: '', model: '' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Erro ao buscar clientes', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente e todos os seus veículos?')) {
      try {
        await api.delete(`/customers/${id}`);
        setCustomers(customers.filter(c => c.id !== id));
      } catch (error) {
        console.error('Erro ao excluir cliente', error);
      }
    }
  };

  const handleRemoveVehicle = async (customerId: string, vehicleId: string) => {
    if (window.confirm('Tem certeza que deseja remover este veículo?')) {
      try {
        await api.delete(`/customers/${customerId}/vehicles/${vehicleId}`);
        fetchCustomers();
      } catch (error) {
        console.error('Erro ao remover veículo', error);
      }
    }
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    try {
      await api.put(`/customers/${editingCustomer.id}`, editingCustomer);
      setEditingCustomer(null);
      fetchCustomers();
    } catch (error) {
      console.error('Erro ao atualizar cliente', error);
    }
  };

  const handleUpdateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;

    const plateRegex = /^[A-Z]{3}[0-9]{1}[A-Z0-9]{1}[0-9]{2}$/;
    const oldPlateRegex = /^[A-Z]{3}[0-9]{4}$/;
    const cleanPlate = editingVehicle.vehicle.plate.replace(/-/g, '').toUpperCase();

    if (!plateRegex.test(cleanPlate) && !oldPlateRegex.test(cleanPlate)) {
      alert('Placa inválida. Use o formato AAA1234 ou AAA1A23.');
      return;
    }

    try {
      await api.put(`/customers/${editingVehicle.customerId}/vehicles/${editingVehicle.vehicle.id}`, { ...editingVehicle.vehicle, plate: cleanPlate });
      setEditingVehicle(null);
      fetchCustomers();
    } catch (error) {
      console.error('Erro ao atualizar veículo', error);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addVehicleTo || !newVehicle.plate || !newVehicle.model) return;

    const plateRegex = /^[A-Z]{3}[0-9]{1}[A-Z0-9]{1}[0-9]{2}$/;
    const oldPlateRegex = /^[A-Z]{3}[0-9]{4}$/;
    const cleanPlate = newVehicle.plate.replace(/-/g, '').toUpperCase();

    if (!plateRegex.test(cleanPlate) && !oldPlateRegex.test(cleanPlate)) {
      alert('Placa inválida. Use o formato AAA1234 ou AAA1A23.');
      return;
    }

    try {
      await api.post(`/customers/${addVehicleTo.id}/vehicles`, { ...newVehicle, plate: cleanPlate });
      setAddVehicleTo(null);
      setNewVehicle({ plate: '', model: '' });
      fetchCustomers();
    } catch (error) {
      console.error('Erro ao vincular veículo', error);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.document.includes(searchTerm)
  );

  if (loading) {
    return <div className="text-center py-8 text-gray-500 font-medium italic animate-pulse">Carregando lista de clientes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <input
            type="text"
            placeholder="Buscar por nome ou CPF/CNPJ..."
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-xs text-gray-500 font-bold bg-blue-50 px-4 py-2 rounded-full border border-blue-100 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
          {filteredCustomers.length} {filteredCustomers.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}
        </div>
      </div>

      {/* MOBILE VIEW: Card List */}
      <div className="md:hidden space-y-4">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-50 bg-gray-50/30">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-black text-gray-900 text-base uppercase leading-tight">{customer.name}</h3>
                <div className="flex gap-2">
                  <button onClick={() => setEditingCustomer(customer)} className="p-2 bg-white rounded-md border border-gray-200 text-primary shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                  <button onClick={() => handleDeleteCustomer(customer.id)} className="p-2 bg-white rounded-md border border-gray-200 text-red-500 shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              </div>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{customer.document} • {customer.phone}</div>
            </div>
            
            <div className="p-4 flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {customer.vehicles.map(v => (
                  <div key={v.id} className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-md px-2 py-1 group/car">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-primary tracking-tighter">{v.plate}</span>
                      <span className="text-[8px] text-blue-400 uppercase leading-none">{v.model}</span>
                    </div>
                    <button onClick={() => setEditingVehicle({customerId: customer.id, vehicle: v})} className="text-blue-300 hover:text-primary"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                  </div>
                ))}
                <button 
                  onClick={() => setAddVehicleTo(customer)}
                  className="flex items-center gap-1 px-2 py-1 border-2 border-dashed border-green-200 text-green-600 rounded-md text-[10px] font-black uppercase hover:bg-green-50 transition-all"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                  NOVO CARRO
                </button>
              </div>
              <div className="text-[10px] text-gray-500 bg-gray-100 p-2 rounded italic">
                {customer.street}, {customer.number} - {customer.city}/{customer.state}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP VIEW: Table */}
      <div className="hidden md:block bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Documento</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Contato</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Frota</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Gerenciar</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <React.Fragment key={customer.id}>
                <tr className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">{customer.name}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-tighter mt-0.5">{customer.city}/{customer.state} • {customer.neighborhood}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{customer.document}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{customer.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => setAddVehicleTo(customer)}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-[10px] font-bold border border-green-100 hover:bg-green-100 transition-all"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                      {customer.vehicles.length === 0 ? 'ADICIONAR CARRO' : `${customer.vehicles.length} VEÍCULOS`}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <button onClick={() => setEditingCustomer(customer)} className="text-primary hover:underline">Editar</button>
                    <button onClick={() => handleDeleteCustomer(customer.id)} className="text-red-400 hover:text-red-600">Excluir</button>
                  </td>
                </tr>
                {customer.vehicles.length > 0 && (
                  <tr className="bg-gray-50/40">
                    <td colSpan={5} className="px-12 py-3">
                      <div className="flex flex-wrap gap-2">
                        {customer.vehicles.map(v => (
                          <div key={v.id} className="flex items-center gap-2 bg-white border border-gray-200 rounded-md px-2.5 py-1.5 shadow-sm group/car">
                            <div className="flex flex-col">
                              <span className="text-[11px] font-black text-gray-800 tracking-tight">{v.plate}</span>
                              <span className="text-[9px] text-gray-400 uppercase leading-none">{v.model}</span>
                            </div>
                            <div className="flex gap-1 ml-2 opacity-0 group-hover/car:opacity-100 transition-opacity">
                              <button onClick={() => setEditingVehicle({customerId: customer.id, vehicle: v})} className="p-1 text-gray-300 hover:text-primary"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                              <button onClick={() => handleRemoveVehicle(customer.id, v.id)} className="p-1 text-gray-300 hover:text-red-500"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {filteredCustomers.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 bg-white rounded-xl border border-gray-100 shadow-inner">
          <div className="bg-gray-50 p-6 rounded-full">
            <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <div className="text-center">
            <p className="text-gray-900 font-black uppercase tracking-widest">Nenhum resultado</p>
            <p className="text-gray-400 text-sm font-medium">Tente buscar por um termo diferente.</p>
          </div>
        </div>
      )}

      {/* MODAL: ADD VEHICLE */}
      {addVehicleTo && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 bg-green-50 flex justify-between items-center">
              <div className="flex flex-col">
                <h3 className="text-sm font-black text-gray-900 uppercase leading-none">Vincular Veículo</h3>
                <span className="text-[10px] text-green-700 font-bold uppercase tracking-widest mt-1 truncate max-w-[200px]">{addVehicleTo.name}</span>
              </div>
              <button onClick={() => setAddVehicleTo(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleAddVehicle} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Placa</label>
                <input 
                  autoFocus
                  placeholder="Ex: BRA2E19"
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border uppercase font-mono font-bold"
                  value={newVehicle.plate}
                  onChange={(e) => setNewVehicle({...newVehicle, plate: e.target.value.toUpperCase()})}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Modelo / Versão</label>
                <input 
                  placeholder="Ex: Toyota Corolla XEi"
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border"
                  value={newVehicle.model}
                  onChange={e => setNewVehicle({...newVehicle, model: e.target.value})}
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => setAddVehicleTo(null)} className="w-full">Cancelar</Button>
                <Button type="submit" variant="primary" className="w-full shadow-lg shadow-primary/20">Confirmar Vínculo</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CUSTOMER */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Editar Dados do Cliente</h3>
              <button onClick={() => setEditingCustomer(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleUpdateCustomer} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Completo</label>
                  <input 
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border"
                    value={editingCustomer.name}
                    onChange={e => setEditingCustomer({...editingCustomer, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Documento (CPF/CNPJ)</label>
                  <input 
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border"
                    value={editingCustomer.document}
                    onChange={e => setEditingCustomer({...editingCustomer, document: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone</label>
                  <input 
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border"
                    value={editingCustomer.phone}
                    onChange={e => setEditingCustomer({...editingCustomer, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="secondary" onClick={() => setEditingCustomer(null)} className="order-2 sm:order-1">Cancelar</Button>
                <Button type="submit" variant="primary" className="order-1 sm:order-2">Salvar Alterações</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT VEHICLE */}
      {editingVehicle && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Editar Veículo</h3>
              <button onClick={() => setEditingVehicle(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleUpdateVehicle} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Placa</label>
                <input 
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border uppercase font-mono font-bold"
                  value={editingVehicle.vehicle.plate}
                  onChange={e => setEditingVehicle({...editingVehicle, vehicle: {...editingVehicle.vehicle, plate: e.target.value.toUpperCase()}})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Modelo</label>
                <input 
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border"
                  value={editingVehicle.vehicle.model}
                  onChange={e => setEditingVehicle({...editingVehicle, vehicle: {...editingVehicle.vehicle, model: e.target.value}})}
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="secondary" onClick={() => setEditingVehicle(null)} className="order-2 sm:order-1">Cancelar</Button>
                <Button type="submit" variant="primary" className="order-1 sm:order-2">Atualizar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
