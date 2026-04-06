import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import ServiceOrderForm from './ServiceOrderForm';

interface ServiceOrder {
  id: string;
  vehiclePlate: string;
  vehicleModel: string;
  description: string;
  status: number;
  isNfEmitted: boolean;
  createdAt: string;
}

const COLUMNS = [
  { id: 0, title: 'Orçamento', bgColor: 'bg-gray-100' },
  { id: 1, title: 'Orçamento Enviado', bgColor: 'bg-purple-50' },
  { id: 2, title: 'Aprovado', bgColor: 'bg-blue-50' },
  { id: 3, title: 'Em Manutenção', bgColor: 'bg-yellow-50' },
  { id: 4, title: 'Pronto', bgColor: 'bg-green-50' },
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

  const handleDrop = async (e: React.DragEvent | null, targetStatusId: number, overrideOrderId?: string) => {
    if (e && e.preventDefault) e.preventDefault();
    const orderId = overrideOrderId || (e?.dataTransfer ? e.dataTransfer.getData('orderId') : null);
    if (!orderId) return;
    
    // Optimistic UI update
    setOrders(prev => 
      prev.map(o => o.id === orderId ? { ...o, status: targetStatusId } : o)
    );

    try {
      await api.patch(`/serviceorders/${orderId}/status`, { status: targetStatusId });
      if (targetStatusId === 5 || targetStatusId === 6) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Erro ao atualizar status', error);
      // Revert on failure
      fetchOrders();
    }
  };

  const handleEmitNf = async (orderId: string) => {
    try {
      await api.post(`/serviceorders/${orderId}/emit-nf`);
      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, isNfEmitted: true } : o));
    } catch (error) {
      console.error('Erro ao emitir NF', error);
      alert('Erro ao emitir Nota Fiscal.');
    }
  };

  const handleCancel = async (orderId: string) => {
    if (window.confirm('Tem certeza que deseja cancelar esta ordem de serviço?')) {
      try {
        await api.patch(`/serviceorders/${orderId}/status`, { status: 6 }); // 6 is Cancelado
        fetchOrders();
      } catch (error) {
        console.error('Erro ao cancelar ordem', error);
      }
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
                  className="bg-white p-3 rounded shadow-sm border border-gray-100 cursor-move hover:shadow-md transition-shadow flex flex-col justify-between relative group"
                >
                  <button 
                    onClick={() => handleCancel(order.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Cancelar Serviço"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                  <div>
                    <div className="font-bold text-gray-900 pr-5">{order.vehiclePlate}</div>
                    <div className="text-xs text-gray-500 font-medium">{order.vehicleModel}</div>
                    <div className="text-sm text-gray-600 mt-1">{order.description}</div>
                    <div className="text-[10px] text-gray-400 mt-2">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  </div>
                  {order.status === 4 && !order.isNfEmitted && (
                    <button
                      onClick={() => handleEmitNf(order.id)}
                      className="mt-3 w-full px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Emitir NF
                    </button>
                  )}
                  {order.status === 4 && order.isNfEmitted && (
                    <button
                      onClick={() => handleDrop(null, 5, order.id)}
                      className="mt-3 w-full px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700 transition-colors shadow-sm"
                    >
                      Finalizar Serviço
                    </button>
                  )}
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
