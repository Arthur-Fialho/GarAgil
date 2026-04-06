import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import ServiceOrderForm from './ServiceOrderForm';

interface ServiceOrder {
  id: string;
  vehiclePlate: string;
  description: string;
  status: number;
}

const COLUMNS = [
  { id: 0, title: 'Orçamento', bgColor: 'bg-gray-100' },
  { id: 1, title: 'Aprovado', bgColor: 'bg-blue-50' },
  { id: 2, title: 'Em Manutenção', bgColor: 'bg-yellow-50' },
  { id: 3, title: 'Pronto', bgColor: 'bg-green-50' },
];

const KanbanBoard: React.FC = () => {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/serviceorders');
      setOrders(response.data);
    } catch (error) {
      console.error('Erro ao buscar ordens', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    e.dataTransfer.setData('orderId', orderId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = async (e: React.DragEvent, targetStatusId: number) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('orderId');
    
    // Optimistic UI update
    setOrders(prev => 
      prev.map(o => o.id === orderId ? { ...o, status: targetStatusId } : o)
    );

    try {
      await api.patch(`/serviceorders/${orderId}/status`, { status: targetStatusId });
    } catch (error) {
      console.error('Erro ao atualizar status', error);
      // Revert on failure
      fetchOrders();
    }
  };

  if (loading) {
    return <div className="text-center py-4">Carregando quadro...</div>;
  }

  return (
    <div className="flex flex-col w-full h-full">
      <ServiceOrderForm onSuccess={fetchOrders} />
      
      <div className="flex flex-col sm:flex-row gap-4 w-full overflow-x-auto pb-4">
        {COLUMNS.map(column => (
          <div 
            key={column.id}
            className={`flex-1 min-w-[250px] rounded-lg border border-gray-200 shadow-sm p-4 ${column.bgColor}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <h4 className="font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2">
              {column.title}
            </h4>
            
            <div className="space-y-3 min-h-[150px]">
              {orders.filter(o => o.status === column.id).map(order => (
                <div 
                  key={order.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, order.id)}
                  className="bg-white p-3 rounded shadow-sm border border-gray-100 cursor-move hover:shadow-md transition-shadow"
                >
                  <div className="font-bold text-gray-900">{order.vehiclePlate}</div>
                  <div className="text-sm text-gray-600 mt-1">{order.description}</div>
                </div>
              ))}
              {orders.filter(o => o.status === column.id).length === 0 && (
                <div className="text-sm text-gray-400 italic text-center py-2">
                  Nenhum veículo
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
