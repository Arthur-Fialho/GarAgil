import React, { useEffect, useState } from 'react';
import api from '../../services/api';

interface ServiceOrderTask {
  id: string;
  description: string;
  isCompleted: boolean;
}

interface ServiceOrder {
  id: string;
  vehiclePlate: string;
  vehicleModel: string;
  description: string;
  status: number;
  createdAt: string;
  tasks: ServiceOrderTask[];
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
    return <div className="text-center py-4 text-gray-500 font-medium">Carregando histórico...</div>;
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
                Serviços Executados
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors align-top">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="font-bold">{order.vehiclePlate}</div>
                  <div className="text-xs text-gray-500">{order.vehicleModel}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <ul className="space-y-1">
                    {order.tasks?.map(task => (
                      <li key={task.id} className="flex items-center gap-2">
                        {task.isCompleted ? (
                          <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <div className="w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center">
                            <span className="relative flex h-2 w-2">
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400"></span>
                            </span>
                          </div>
                        )}
                        <span className={task.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}>
                          {task.description}
                        </span>
                      </li>
                    ))}
                  </ul>
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
                <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500 italic font-medium">
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
