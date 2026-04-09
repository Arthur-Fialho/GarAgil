import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Button from '../../components/Button';

interface FinancialAccount {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  isPaid?: boolean;
  isReceived?: boolean;
  paymentDate?: string;
  receivedDate?: string;
}

interface FinancialSummary {
  totalPaid: number;
  totalToPay: number;
  totalReceived: number;
  totalToReceive: number;
  balance: number;
  forecastBalance: number;
}

type PeriodFilter = '15days' | 'month' | 'custom' | 'all';

const FinancialDashboard: React.FC = () => {
  const [payables, setPayables] = useState<FinancialAccount[]>([]);
  const [receivables, setReceivables] = useState<FinancialAccount[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Date Filters
  const [period, setPeriod] = useState<PeriodFilter>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form states
  const [showForm, setShowForm] = useState<'payable' | 'receivable' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ description: '', amount: '', dueDate: new Date().toISOString().split('T')[0] });

  // Update dates based on predefined periods
  useEffect(() => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    if (period === '15days') {
      start.setDate(today.getDate() - 15);
      end.setDate(today.getDate() + 15);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    } else if (period === 'month') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    } else if (period === 'all') {
      setStartDate('');
      setEndDate('');
    }
  }, [period]);

  useEffect(() => {
    // Only fetch if it's 'all', or if we have both dates defined (prevents double fetch during state transition)
    if (period === 'all' || (startDate && endDate)) {
      fetchData();
    }
  }, [startDate, endDate, period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append('start', startDate);
      if (endDate) params.append('end', endDate);

      const qs = params.toString() ? `?${params.toString()}` : '';

      const [pRes, rRes, sRes] = await Promise.all([
        api.get(`/financial/payables${qs}`),
        api.get(`/financial/receivables${qs}`),
        api.get(`/financial/summary${qs}`)
      ]);
      setPayables(pRes.data);
      setReceivables(rRes.data);
      setSummary(sRes.data);
    } catch (error) {
      console.error('Erro ao buscar dados financeiros', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.dueDate) return;

    const endpoint = showForm === 'payable' ? 'payables' : 'receivables';
    try {
      if (editingId) {
        await api.put(`/financial/${endpoint}/${editingId}`, {
          ...formData,
          amount: parseFloat(formData.amount)
        });
      } else {
        await api.post(`/financial/${endpoint}`, {
          ...formData,
          amount: parseFloat(formData.amount)
        });
      }
      
      closeForm();
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar conta', error);
    }
  };

  const handleAction = async (type: 'pay' | 'receive' | 'undo-pay' | 'undo-receive', id: string) => {
    const endpoint = type.includes('pay') ? 'payables' : 'receivables';
    try {
      await api.post(`/financial/${endpoint}/${id}/${type}`);
      fetchData();
    } catch (error) {
      console.error(`Erro ao processar ${type}`, error);
    }
  };

  const openForm = (type: 'payable' | 'receivable', account?: FinancialAccount) => {
    if (account) {
      setEditingId(account.id);
      setFormData({
        description: account.description,
        amount: account.amount.toString(),
        dueDate: account.dueDate.split('T')[0]
      });
    } else {
      setEditingId(null);
      setFormData({ description: '', amount: '', dueDate: new Date().toISOString().split('T')[0] });
    }
    setShowForm(type);
  };

  const closeForm = () => {
    setShowForm(null);
    setEditingId(null);
    setFormData({ description: '', amount: '', dueDate: new Date().toISOString().split('T')[0] });
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* FILTER HEADER */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Período:</span>
          <select 
            className="rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border bg-white text-gray-700 font-bold"
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
          >
            <option value="month">Este Mês</option>
            <option value="15days">Últimos 15 e Próximos 15 Dias</option>
            <option value="all">Todo o Histórico</option>
            <option value="custom">Personalizado</option>
          </select>
          
          {period === 'custom' && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
              <input 
                type="date" 
                className="rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border text-gray-700"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="text-gray-400 text-sm">até</span>
              <input 
                type="date" 
                className="rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border text-gray-700"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {loading && !summary && (
        <div className="text-center py-10 italic text-gray-500 animate-pulse">Carregando painel financeiro...</div>
      )}

      {/* SUMMARY CARDS */}
      {!loading && summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Recebido</p>
            <p className="text-2xl font-black text-green-600">{formatCurrency(summary.totalReceived)}</p>
            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">A receber: {formatCurrency(summary.totalToReceive)}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Pago</p>
            <p className="text-2xl font-black text-red-500">{formatCurrency(summary.totalPaid)}</p>
            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">A pagar: {formatCurrency(summary.totalToPay)}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Saldo em Caixa</p>
            <p className={`text-2xl font-black ${summary.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {formatCurrency(summary.balance)}
            </p>
            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">Saldo Atual Real</p>
          </div>
          <div className="bg-primary p-6 rounded-2xl shadow-lg shadow-primary/20 text-white">
            <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Previsão Final</p>
            <p className="text-2xl font-black">{formatCurrency(summary.forecastBalance)}</p>
            <p className="text-[10px] text-white/60 mt-2 font-bold uppercase tracking-tighter">Total Geral Previsto</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* RECEIVABLES SECTION */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-green-50 border-b border-green-100 flex justify-between items-center">
            <h3 className="text-sm font-black text-green-800 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Contas a Receber
            </h3>
            <button 
              onClick={() => openForm('receivable')}
              className="p-1.5 bg-white rounded-md border border-green-200 text-green-600 hover:bg-green-50 transition-colors"
              title="Adicionar Receita"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
          <div className="flex-1 overflow-auto max-h-[400px]">
            <table className="min-w-full divide-y divide-gray-50">
              <thead className="bg-gray-50/50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Vencimento</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Descrição</th>
                  <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase">Valor</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {receivables.map(r => (
                  <tr key={r.id} className={`hover:bg-green-50/20 transition-colors group ${r.isReceived ? 'opacity-60 bg-green-50/10' : ''}`}>
                    <td className={`px-6 py-4 whitespace-nowrap text-xs font-mono ${r.isReceived ? 'text-gray-400 line-through' : 'text-gray-500'}`}>
                      {new Date(r.dueDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className={`px-6 py-4 text-xs font-bold uppercase tracking-tighter ${r.isReceived ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {r.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-green-600 text-right">{formatCurrency(r.amount)}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {!r.isReceived ? (
                        <>
                          <button onClick={() => openForm('receivable', r)} className="text-gray-400 hover:text-primary" title="Editar">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button 
                            onClick={() => handleAction('receive', r.id)}
                            className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-black uppercase hover:bg-green-200"
                          >
                            Receber
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleAction('undo-receive', r.id)}
                          className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-[10px] font-black uppercase hover:bg-gray-200 hover:text-red-500 flex items-center gap-1"
                          title="Desfazer Recebimento"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                          Desfazer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {receivables.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-400 text-xs italic">Nenhum registro encontrado no período.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAYABLES SECTION */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-red-50 border-b border-red-100 flex justify-between items-center">
            <h3 className="text-sm font-black text-red-800 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              Contas a Pagar
            </h3>
            <button 
              onClick={() => openForm('payable')}
              className="p-1.5 bg-white rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
              title="Adicionar Despesa"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
          <div className="flex-1 overflow-auto max-h-[400px]">
            <table className="min-w-full divide-y divide-gray-50">
              <thead className="bg-gray-50/50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Vencimento</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Descrição</th>
                  <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase">Valor</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payables.map(p => (
                  <tr key={p.id} className={`hover:bg-red-50/20 transition-colors group ${p.isPaid ? 'opacity-60 bg-red-50/10' : ''}`}>
                    <td className={`px-6 py-4 whitespace-nowrap text-xs font-mono ${p.isPaid ? 'text-gray-400 line-through' : 'text-gray-500'}`}>
                      {new Date(p.dueDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className={`px-6 py-4 text-xs font-bold uppercase tracking-tighter ${p.isPaid ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {p.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-red-500 text-right">{formatCurrency(p.amount)}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {!p.isPaid ? (
                        <>
                          <button onClick={() => openForm('payable', p)} className="text-gray-400 hover:text-primary" title="Editar">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button 
                            onClick={() => handleAction('pay', p.id)}
                            className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-black uppercase hover:bg-red-200"
                          >
                            Pagar
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleAction('undo-pay', p.id)}
                          className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-[10px] font-black uppercase hover:bg-gray-200 hover:text-red-500 flex items-center gap-1"
                          title="Desfazer Pagamento"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                          Desfazer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {payables.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-400 text-xs italic">Nenhum registro encontrado no período.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
            <div className={`px-6 py-4 border-b border-gray-100 flex justify-between items-center ${showForm === 'payable' ? 'bg-red-50' : 'bg-green-50'}`}>
              <h3 className="text-sm font-black text-gray-900 uppercase">
                {editingId ? 'Editar Conta' : (showForm === 'payable' ? 'Nova Conta a Pagar' : 'Nova Conta a Receber')}
              </h3>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreateOrUpdateAccount} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Descrição</label>
                <input 
                  autoFocus
                  placeholder="Ex: Fornecedor de Peças"
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2.5 border uppercase font-bold text-gray-900"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Valor (R$)</label>
                  <input 
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2.5 border font-black text-gray-900"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Vencimento</label>
                  <input 
                    type="date"
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2.5 border text-gray-900 font-bold"
                    value={formData.dueDate}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <Button type="submit" variant="primary" className="w-full shadow-lg shadow-primary/20 uppercase font-black tracking-widest py-3">
                  Salvar Lançamento
                </Button>
                <Button type="button" variant="secondary" onClick={closeForm} className="w-full">Cancelar</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default FinancialDashboard;
