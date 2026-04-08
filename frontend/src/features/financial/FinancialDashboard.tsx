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

const FinancialDashboard: React.FC = () => {
  const [payables, setPayables] = useState<FinancialAccount[]>([]);
  const [receivables, setReceivables] = useState<FinancialAccount[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showForm, setShowForm] = useState<'payable' | 'receivable' | null>(null);
  const [formData, setFormData] = useState({ description: '', amount: '', dueDate: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, rRes, sRes] = await Promise.all([
        api.get('/financial/payables'),
        api.get('/financial/receivables'),
        api.get('/financial/summary')
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

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.dueDate) return;

    const endpoint = showForm === 'payable' ? 'payables' : 'receivables';
    try {
      await api.post(`/financial/${endpoint}`, {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      setShowForm(null);
      setFormData({ description: '', amount: '', dueDate: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (error) {
      console.error('Erro ao criar conta', error);
    }
  };

  const handleAction = async (type: 'pay' | 'receive', id: string) => {
    const endpoint = type === 'pay' ? 'payables' : 'receivables';
    const action = type === 'pay' ? 'pay' : 'receive';
    try {
      await api.post(`/financial/${endpoint}/${id}/${action}`);
      fetchData();
    } catch (error) {
      console.error(`Erro ao processar ${action}`, error);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (loading && !summary) return <div className="text-center py-10 italic text-gray-500">Carregando painel financeiro...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Recebido</p>
          <p className="text-2xl font-black text-green-600">{formatCurrency(summary?.totalReceived || 0)}</p>
          <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">A receber: {formatCurrency(summary?.totalToReceive || 0)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Pago</p>
          <p className="text-2xl font-black text-red-500">{formatCurrency(summary?.totalPaid || 0)}</p>
          <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">A pagar: {formatCurrency(summary?.totalToPay || 0)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Saldo em Caixa</p>
          <p className={`text-2xl font-black ${(summary?.balance || 0) >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            {formatCurrency(summary?.balance || 0)}
          </p>
          <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">Saldo Atual Real</p>
        </div>
        <div className="bg-primary p-6 rounded-2xl shadow-lg shadow-primary/20 text-white">
          <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Previsão Final</p>
          <p className="text-2xl font-black">{formatCurrency(summary?.forecastBalance || 0)}</p>
          <p className="text-[10px] text-white/60 mt-2 font-bold uppercase tracking-tighter">Total Geral Previsto</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* RECEIVABLES SECTION */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-green-50 border-b border-green-100 flex justify-between items-center">
            <h3 className="text-sm font-black text-green-800 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Contas a Receber
            </h3>
            <button 
              onClick={() => setShowForm('receivable')}
              className="p-1.5 bg-white rounded-md border border-green-200 text-green-600 hover:bg-green-50 transition-colors"
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
                  <tr key={r.id} className={`hover:bg-green-50/20 transition-colors ${r.isReceived ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500">
                      {new Date(r.dueDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-tighter">{r.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-green-600 text-right">{formatCurrency(r.amount)}</td>
                    <td className="px-6 py-4 text-right">
                      {!r.isReceived && (
                        <button 
                          onClick={() => handleAction('receive', r.id)}
                          className="text-[10px] font-black text-green-600 hover:underline uppercase"
                        >
                          Receber
                        </button>
                      )}
                      {r.isReceived && <svg className="w-4 h-4 text-green-500 ml-auto" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                    </td>
                  </tr>
                ))}
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
              onClick={() => setShowForm('payable')}
              className="p-1.5 bg-white rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
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
                  <tr key={p.id} className={`hover:bg-red-50/20 transition-colors ${p.isPaid ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500">
                      {new Date(p.dueDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-tighter">{p.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-red-500 text-right">{formatCurrency(p.amount)}</td>
                    <td className="px-6 py-4 text-right">
                      {!p.isPaid && (
                        <button 
                          onClick={() => handleAction('pay', p.id)}
                          className="text-[10px] font-black text-red-600 hover:underline uppercase"
                        >
                          Pagar
                        </button>
                      )}
                      {p.isPaid && <svg className="w-4 h-4 text-red-500 ml-auto" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                    </td>
                  </tr>
                ))}
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
                {showForm === 'payable' ? 'Nova Conta a Pagar' : 'Nova Conta a Receber'}
              </h3>
              <button onClick={() => setShowForm(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreateAccount} className="p-6 space-y-4">
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
                <Button type="button" variant="secondary" onClick={() => setShowForm(null)} className="w-full">Cancelar</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default FinancialDashboard;
