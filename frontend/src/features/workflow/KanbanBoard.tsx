import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import ServiceOrderForm from './ServiceOrderForm';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';

interface ServiceOrder {
  id: string;
  vehiclePlate: string;
  vehicleModel: string;
  description: string;
  status: number;
  isNfEmitted: boolean;
  createdAt: string;
  mechanicNotes?: string;
}

const COLUMNS = [
  { id: 0, title: 'Orçamento', bgColor: 'bg-gray-100' },
  { id: 1, title: 'Orçamento Enviado', bgColor: 'bg-purple-50' },
  { id: 2, title: 'Aprovado', bgColor: 'bg-blue-50' },
  { id: 3, title: 'Em Manutenção', bgColor: 'bg-yellow-50' },
  { id: 4, title: 'Pronto', bgColor: 'bg-green-50' },
];

const KanbanBoard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Mechanic Modal State
  const [mechanicModal, setMechanicModal] = useState<{ isOpen: boolean, orderId: string, type: 'finish' | 'additional' | null }>({
    isOpen: false,
    orderId: '',
    type: null
  });
  const [mechanicNotes, setMechanicNotes] = useState('');

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
    if (user?.role === 'Mechanic') {
      // Mechanics cannot drag cards, they must use buttons
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('orderId', orderId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (user?.role === 'Mechanic') return;
    e.preventDefault(); 
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
      fetchOrders();
    }
  };

  const handleEmitNf = async (orderId: string) => {
    try {
      await api.post(`/serviceorders/${orderId}/emit-nf`);
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

  const executeMechanicAction = async () => {
    if (!mechanicNotes.trim()) {
      alert('Por favor, adicione um comentário.');
      return;
    }

    const endpoint = mechanicModal.type === 'finish' ? 'finish-maintenance' : 'additional-repair';
    
    try {
      setLoading(true);
      await api.post(`/serviceorders/${mechanicModal.orderId}/${endpoint}`, { notes: mechanicNotes });
      setMechanicModal({ isOpen: false, orderId: '', type: null });
      setMechanicNotes('');
      fetchOrders();
    } catch (error) {
      console.error('Erro ao processar ação do mecânico', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && orders.length === 0) {
    return <div className="text-center py-4">Carregando quadro...</div>;
  }

  return (
    <div className="flex flex-col w-full h-full relative">
      {user?.role === 'Admin' && <ServiceOrderForm onSuccess={fetchOrders} />}
      
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
                  draggable={user?.role === 'Admin'}
                  onDragStart={(e) => handleDragStart(e, order.id)}
                  className={`bg-white p-3 rounded shadow-sm border border-gray-100 transition-shadow flex flex-col justify-between relative group ${user?.role === 'Admin' ? 'cursor-move' : ''}`}
                >
                  {user?.role === 'Admin' && (
                    <button 
                      onClick={() => handleCancel(order.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Cancelar Serviço"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  )}
                  <div>
                    <div className="font-bold text-gray-900 pr-5">{order.vehiclePlate}</div>
                    <div className="text-xs text-gray-500 font-medium">{order.vehicleModel}</div>
                    <div className="text-sm text-gray-600 mt-1 line-clamp-2">{order.description}</div>
                    {order.mechanicNotes && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-[10px] text-blue-800 italic border border-blue-100">
                        Obs: {order.mechanicNotes}
                      </div>
                    )}
                    <div className="text-[10px] text-gray-400 mt-2">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  </div>

                  {/* ADMIN ACTIONS */}
                  {user?.role === 'Admin' && order.status === 4 && !order.isNfEmitted && (
                    <button
                      onClick={() => handleEmitNf(order.id)}
                      className="mt-3 w-full px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Emitir NF
                    </button>
                  )}
                  {user?.role === 'Admin' && order.status === 4 && order.isNfEmitted && (
                    <button
                      onClick={() => handleDrop(null, 5, order.id)}
                      className="mt-3 w-full px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700 transition-colors shadow-sm"
                    >
                      Finalizar Serviço
                    </button>
                  )}

                  {/* MECHANIC ACTIONS */}
                  {user?.role === 'Mechanic' && order.status === 3 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setMechanicModal({ isOpen: true, orderId: order.id, type: 'finish' })}
                        className="px-2 py-1.5 bg-green-600 text-white text-[10px] font-bold rounded hover:bg-green-700 transition-colors uppercase tracking-wider shadow-sm"
                      >
                        Concluir
                      </button>
                      <button
                        onClick={() => setMechanicModal({ isOpen: true, orderId: order.id, type: 'additional' })}
                        className="px-2 py-1.5 bg-yellow-500 text-white text-[10px] font-bold rounded hover:bg-yellow-600 transition-colors uppercase tracking-wider shadow-sm"
                      >
                        + Reparo
                      </button>
                    </div>
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

      {/* MECHANIC ACTION MODAL */}
      {mechanicModal.isOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className={`px-6 py-4 border-b border-gray-100 flex justify-between items-center ${mechanicModal.type === 'finish' ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {mechanicModal.type === 'finish' ? (
                  <><svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Concluir Manutenção</>
                ) : (
                  <><svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> Solicitar Reparo Adicional</>
                )}
              </h3>
              <button onClick={() => setMechanicModal({ isOpen: false, orderId: '', type: null })} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 font-medium">
                {mechanicModal.type === 'finish' 
                  ? 'Descreva o que foi feito no veículo para finalizar o serviço.' 
                  : 'Descreva quais problemas extras foram encontrados que precisam de novo orçamento.'}
              </p>
              <textarea 
                className="w-full h-32 rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border resize-none"
                placeholder="Digite aqui as observações técnicas..."
                value={mechanicNotes}
                onChange={e => setMechanicNotes(e.target.value)}
                required
              />
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setMechanicModal({ isOpen: false, orderId: '', type: null })}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={executeMechanicAction}
                  variant={mechanicModal.type === 'finish' ? 'success' : 'primary'}
                  disabled={loading || !mechanicNotes.trim()}
                >
                  {loading ? 'Processando...' : 'Confirmar Ação'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
