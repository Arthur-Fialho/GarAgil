import React, { useEffect, useState } from 'react';
import api from '../../services/api';

interface ServiceOrder {
  id: string;
  vehiclePlate: string;
  description: string;
  status: number;
}

const ServiceHistory: React.FC = () => {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/serviceorders');
      // Filter "Finalizado" (status == 4) and "Cancelado" (status == 5)
      setOrders(response.data.filter((o: ServiceOrder) => o.status === 4 || o.status === 5));
    } catch (error) {
      console.error('Erro ao buscar histórico', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Carregando histórico...</div>;
  }

  return (
    <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Placa do Veículo
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
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                {order.vehiclePlate}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {order.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 4 ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}>
                  {order.status === 4 ? 'Finalizado' : 'Cancelado'}
                </span>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                Nenhum serviço finalizado ou cancelado ainda.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ServiceHistory;
