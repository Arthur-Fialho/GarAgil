import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import ServiceOrderForm from './ServiceOrderForm';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';

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
  isNfEmitted: boolean;
  createdAt: string;
  mechanicNotes?: string;
  tasks: ServiceOrderTask[];
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
  
  // Mechanic Action Modal State
  const [mechanicModal, setMechanicModal] = useState<{ isOpen: boolean, orderId: string }>({
    isOpen: false,
    orderId: ''
  });
  const [mechanicNotes, setMechanicNotes] = useState('');

  // Add Task Modal State
  const [addTaskModal, setAddTaskModal] = useState<{ isOpen: boolean, orderId: string }>({
    isOpen: false,
    orderId: ''
  });
  const [newTaskDescription, setNewTaskDescription] = useState('');

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
        await api.patch(`/serviceorders/${orderId}/status`, { status: 6 }); 
        fetchOrders();
      } catch (error) {
        console.error('Erro ao cancelar ordem', error);
      }
    }
  };

  const handleToggleTask = async (orderId: string, taskId: string) => {
    try {
      await api.patch(`/serviceorders/${orderId}/tasks/${taskId}/toggle`);
      fetchOrders();
    } catch (error) {
      console.error('Erro ao alternar status da tarefa', error);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskDescription.trim()) return;
    try {
      setLoading(true);
      await api.post(`/serviceorders/${addTaskModal.orderId}/tasks`, { description: newTaskDescription });
      setAddTaskModal({ isOpen: false, orderId: '' });
      setNewTaskDescription('');
      await fetchOrders();
    } catch (error) {
      console.error('Erro ao adicionar tarefa', error);
    } finally {
      setLoading(false);
    }
  };

  const executeMechanicAction = async () => {
    if (!mechanicNotes.trim()) {
      alert('Por favor, descreva o serviço realizado.');
      return;
    }

    try {
      setLoading(true);
      await api.post(`/serviceorders/${mechanicModal.orderId}/finish-maintenance`, { 
        notes: mechanicNotes
      });
      setMechanicModal({ isOpen: false, orderId: '' });
      setMechanicNotes('');
      await fetchOrders();
    } catch (error: any) {
      console.error('Erro ao processar ação', error);
      const msg = error.response?.data?.message || error.message;
      alert(`Erro ao processar ação: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && orders.length === 0) {
    return <div className="text-center py-4 text-gray-500 font-medium">Carregando quadro...</div>;
  }

  return (
    <div className="flex flex-col w-full h-full relative">
      {user?.role === 'Admin' && <ServiceOrderForm onSuccess={fetchOrders} />}
      
      <div className="flex flex-col sm:flex-row gap-4 w-full overflow-x-auto pb-4">
        {COLUMNS.map(column => (
          <div 
            key={column.id}
            className={`flex-1 min-w-[300px] sm:min-w-[250px] rounded-lg border border-gray-200 shadow-sm p-4 ${column.bgColor}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <h4 className="font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2 flex justify-between items-center">
              {column.title}
              <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs text-gray-500 border border-gray-100">
                {orders.filter(o => o.status === column.id).length}
              </span>
            </h4>
            
            <div className="space-y-3 min-h-[150px]">
              {orders.filter(o => o.status === column.id).map(order => (
                <div 
                  key={order.id}
                  draggable={user?.role === 'Admin'}
                  onDragStart={(e) => handleDragStart(e, order.id)}
                  className={`bg-white p-3 rounded shadow-sm border border-gray-100 transition-shadow flex flex-col justify-between relative group ${user?.role === 'Admin' ? 'cursor-move' : ''}`}
                >
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setAddTaskModal({ isOpen: true, orderId: order.id })}
                      className="p-1 text-gray-400 hover:text-primary rounded-full hover:bg-gray-50"
                      title="Adicionar Serviço"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    {user?.role === 'Admin' && (
                      <button 
                        onClick={() => handleCancel(order.id)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-50"
                        title="Cancelar Serviço"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    )}
                  </div>

                  <div>
                    <div className="font-bold text-gray-900 pr-12 uppercase tracking-wider">{order.vehiclePlate}</div>
                    <div className="text-xs text-gray-500 font-medium">{order.vehicleModel}</div>
                    
                    <div className="mt-3 space-y-2">
                      {order.tasks?.map(task => (
                        <div key={task.id} className="flex items-start gap-2 group/task">
                          <button 
                            onClick={() => handleToggleTask(order.id, task.id)}
                            className={`w-4 h-4 mt-0.5 shrink-0 rounded border flex items-center justify-center transition-colors ${task.isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-primary'}`}
                          >
                            {task.isCompleted ? (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                            ) : (
                              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse group-hover/task:bg-primary"></div>
                            )}
                          </button>
                          <span 
                            onClick={() => handleToggleTask(order.id, task.id)}
                            className={`text-xs cursor-pointer select-none ${task.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}
                          >
                            {task.description}
                          </span>
                        </div>
                      ))}
                    </div>

                    {order.mechanicNotes && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-[10px] text-blue-800 italic border border-blue-100">
                        Obs: {order.mechanicNotes}
                      </div>
                    )}
                    <div className="text-[10px] text-gray-400 mt-2 flex justify-between items-center">
                      <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                  </div>

                  {/* MOBILE MOVE BUTTONS (Only for Admin) */}
                  {user?.role === 'Admin' && (
                    <div className="flex sm:hidden gap-2 mt-4 pt-3 border-t border-gray-50">
                      {order.status > 0 && (
                        <button 
                          onClick={() => handleDrop(null, order.status - 1, order.id)}
                          className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-50 text-gray-600 rounded-lg text-[10px] font-black uppercase border border-gray-200"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                          Voltar
                        </button>
                      )}
                      {order.status < 4 && (
                        <button 
                          onClick={() => handleDrop(null, order.status + 1, order.id)}
                          className="flex-1 flex items-center justify-center gap-1 py-2 bg-primary text-white rounded-lg text-[10px] font-black uppercase shadow-sm"
                        >
                          Avançar
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                        </button>
                      )}
                    </div>
                  )}

                  {(user?.role === 'Mechanic' || user?.role === 'Admin') && order.status === 3 && (
                    <div className="mt-3">
                      <button
                        onClick={() => setMechanicModal({ isOpen: true, orderId: order.id })}
                        className="w-full py-2 bg-green-600 text-white text-[10px] font-black rounded-lg hover:bg-green-700 transition-colors uppercase tracking-widest shadow-sm border-b-4 border-green-800 active:border-b-0 active:mt-[4px]"
                      >
                        CONCLUIR SERVIÇO
                      </button>
                    </div>
                  )}

                  {user?.role === 'Admin' && order.status === 4 && !order.isNfEmitted && (
                    <button
                      onClick={() => handleEmitNf(order.id)}
                      className="mt-3 w-full px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      EMITIR NOTA FISCAL
                    </button>
                  )}
                  {user?.role === 'Admin' && order.status === 4 && order.isNfEmitted && (
                    <button
                      onClick={() => handleDrop(null, 5, order.id)}
                      className="mt-3 w-full px-3 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                    >
                      ENTREGAR VEÍCULO
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

      {/* ADD TASK MODAL */}
      {addTaskModal.isOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                Novo Serviço
              </h3>
              <button onClick={() => setAddTaskModal({ isOpen: false, orderId: '' })} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <input 
                autoFocus
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border"
                placeholder="Ex: Alinhamento e balanceamento..."
                value={newTaskDescription}
                onChange={e => setNewTaskDescription(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddTask(); }}
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => setAddTaskModal({ isOpen: false, orderId: '' })}>Cancelar</Button>
                <Button onClick={handleAddTask} disabled={!newTaskDescription.trim() || loading}>Adicionar</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONCLUIR MODAL */}
      {mechanicModal.isOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-green-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> 
                Concluir Manutenção
              </h3>
              <button onClick={() => { setMechanicModal({ isOpen: false, orderId: '' }); setMechanicNotes(''); }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4 text-left">
              <p className="text-sm text-gray-600 font-medium">
                Descreva o que foi realizado ou se foram identificados novos problemas técnicos para a administração.
              </p>
              <textarea 
                className="w-full h-32 rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 border resize-none"
                placeholder="Ex: Trocado filtro e óleo. Notei desgaste nas pastilhas dianteiras que precisam de atenção."
                value={mechanicNotes}
                onChange={e => setMechanicNotes(e.target.value)}
                required
              />
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => { setMechanicModal({ isOpen: false, orderId: '' }); setMechanicNotes(''); }}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={executeMechanicAction}
                  variant="success"
                  disabled={loading || !mechanicNotes.trim()}
                >
                  {loading ? 'Processando...' : 'Confirmar e Concluir'}
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
