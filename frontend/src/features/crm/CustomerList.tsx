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
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<{customerId: string, vehicle: Vehicle} | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // ID of customer being deleted

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
        fetchCustomers(); // Refresh to get updated list
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

    try {
      await api.put(`/customers/${editingVehicle.customerId}/vehicles/${editingVehicle.vehicle.id}`, editingVehicle.vehicle);
      setEditingVehicle(null);
      fetchCustomers();
    } catch (error) {
      console.error('Erro ao atualizar veículo', error);
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-gray-500">Carregando clientes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Veículos</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <React.Fragment key={customer.id}>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{customer.name}</div>
                    <div className="text-xs text-gray-500">{customer.street}, {customer.number} - {customer.city}/{customer.state}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.document}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                      {customer.vehicles.length} {customer.vehicles.length === 1 ? 'veículo' : 'veículos'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button 
                      onClick={() => setEditingCustomer(customer)}
                      className="text-primary hover:text-primary-hover"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDeleteCustomer(customer.id)}
                      className="text-danger hover:text-danger-hover"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
                {customer.vehicles.length > 0 && (
                  <tr className="bg-gray-50/30">
                    <td colSpan={5} className="px-12 py-3">
                      <div className="flex flex-wrap gap-3">
                        {customer.vehicles.map(v => (
                          <div key={v.id} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm group">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-gray-900">{v.plate}</span>
                              <span className="text-[10px] text-gray-500">{v.model}</span>
                            </div>
                            <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => setEditingVehicle({customerId: customer.id, vehicle: v})}
                                className="p-1 text-gray-400 hover:text-primary"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                              <button 
                                onClick={() => handleRemoveVehicle(customer.id, v.id)}
                                className="p-1 text-gray-400 hover:text-danger"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500 italic">
                  Nenhum cliente cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Editar Cliente</h3>
              <button onClick={() => setEditingCustomer(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleUpdateCustomer} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                  <input 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border"
                    value={editingCustomer.name}
                    onChange={e => setEditingCustomer({...editingCustomer, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Documento</label>
                  <input 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border"
                    value={editingCustomer.document}
                    onChange={e => setEditingCustomer({...editingCustomer, document: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefone</label>
                  <input 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border"
                    value={editingCustomer.phone}
                    onChange={e => setEditingCustomer({...editingCustomer, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="secondary" onClick={() => setEditingCustomer(null)}>Cancelar</Button>
                <Button type="submit" variant="primary">Salvar Alterações</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {editingVehicle && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Editar Veículo</h3>
              <button onClick={() => setEditingVehicle(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleUpdateVehicle} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Placa</label>
                <input 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border uppercase"
                  value={editingVehicle.vehicle.plate}
                  onChange={e => setEditingVehicle({...editingVehicle, vehicle: {...editingVehicle.vehicle, plate: e.target.value}})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Modelo</label>
                <input 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border"
                  value={editingVehicle.vehicle.model}
                  onChange={e => setEditingVehicle({...editingVehicle, vehicle: {...editingVehicle.vehicle, model: e.target.value}})}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="secondary" onClick={() => setEditingVehicle(null)}>Cancelar</Button>
                <Button type="submit" variant="primary">Salvar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
