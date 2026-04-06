import React, { useEffect, useState } from 'react';
import api from '../../services/api';

interface ServiceOrder {
  id: string;
  vehiclePlate: string;
  vehicleModel: string;
  description: string;
  status: number;
  createdAt: string;
}

const ServiceHistory: React.FC = () => {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchPlate, setSearchPlate] = useState('');
  const [searchDate, setSearchDate] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/serviceorders');
      // Filter "Finalizado" (status == 5) and "Cancelado" (status == 6)
      setOrders(response.data.filter((o: ServiceOrder) => o.status === 5 || o.status === 6));
    } catch (error) {
      console.error('Erro ao buscar histórico', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchPlate = order.vehiclePlate.toLowerCase().includes(searchPlate.toLowerCase());
    let matchDate = true;
    if (searchDate && order.createdAt) {
       const orderDate = new Date(order.createdAt).toLocaleDateString('pt-BR');
       matchDate = orderDate.includes(searchDate);
    }
    return matchPlate && matchDate;
  });

  if (loading) {
    return <div className="text-center py-4">Carregando histórico...</div>;
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 shadow-sm rounded-lg border border-gray-200">
        <div className="flex-1">
          <label htmlFor="searchPlate" className="block text-sm font-medium text-gray-700">Buscar por Placa</label>
          <input
            id="searchPlate"
            type="text"
            placeholder="ABC-1234"
            value={searchPlate}
            onChange={(e) => setSearchPlate(e.target.value)}
            className="mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:ring-primary focus:border-primary border-gray-300 px-3 py-2 border"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="searchDate" className="block text-sm font-medium text-gray-700">Buscar por Data (DD/MM/AAAA)</label>
          <input
            id="searchDate"
            type="text"
            placeholder="Ex: 05/04/2026"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:ring-primary focus:border-primary border-gray-300 px-3 py-2 border"
          />
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Veículo
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descrição do Serviço
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="font-bold">{order.vehiclePlate}</div>
                  <div className="text-xs text-gray-500">{order.vehicleModel}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 5 ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}>
                    {order.status === 5 ? 'Finalizado' : 'Cancelado'}
                  </span>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiceHistory;
