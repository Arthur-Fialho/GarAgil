import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';

interface Part {
  id: string;
  name: string;
  sku: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
}

const InventoryDashboard: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showForm, setShowForm] = useState<'create' | 'edit' | null>(null);
  const [showStockModal, setShowStockModal] = useState<'add' | 'remove' | null>(null);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);

  // Form State
  const [formData, setFormData] = useState({ name: '', sku: '', costPrice: '', margin: '', initialStock: '' });
  const [stockQuantity, setStockQuantity] = useState('');

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inventory');
      setParts(res.data);
    } catch (error) {
      console.error('Erro ao buscar estoque', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) return;

    try {
      const costPrice = parseFloat(formData.costPrice || '0');
      const margin = parseFloat(formData.margin || '0');
      const sellingPrice = costPrice * (1 + margin / 100);

      if (showForm === 'create') {
        await api.post('/inventory', {
          name: formData.name,
          sku: formData.sku,
          costPrice: costPrice,
          sellingPrice: sellingPrice,
          initialStock: parseInt(formData.initialStock || '0')
        });
      } else if (showForm === 'edit' && selectedPart) {
        await api.put(`/inventory/${selectedPart.id}`, {
          name: formData.name,
          sku: formData.sku,
          costPrice: costPrice,
          sellingPrice: sellingPrice
        });
      }
      setShowForm(null);
      setSelectedPart(null);
      fetchParts();
    } catch (error: any) {
      console.error('Erro ao salvar peça', error);
      alert(error.response?.data?.message || 'Erro ao salvar peça.');
    }
  };

  const handleStockAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPart || !stockQuantity) return;
    
    const qty = parseInt(stockQuantity);
    if (qty <= 0) {
      alert('Quantidade deve ser maior que zero.');
      return;
    }

    try {
      const endpoint = showStockModal === 'add' ? 'add-stock' : 'remove-stock';
      await api.post(`/inventory/${selectedPart.id}/${endpoint}`, { quantity: qty });
      setShowStockModal(null);
      setSelectedPart(null);
      setStockQuantity('');
      fetchParts();
    } catch (error: any) {
      console.error('Erro ao atualizar estoque', error);
      alert(error.response?.data?.message || 'Erro ao atualizar estoque.');
    }
  };

  const openCreateForm = () => {
    setFormData({ name: '', sku: '', costPrice: '', margin: '', initialStock: '' });
    setShowForm('create');
  };

  const openEditForm = (part: Part) => {
    const cost = part.costPrice;
    const sell = part.sellingPrice;
    const margin = cost > 0 ? ((sell / cost) - 1) * 100 : 0;

    setFormData({
      name: part.name,
      sku: part.sku,
      costPrice: cost.toString(),
      margin: margin.toFixed(2),
      initialStock: '0' // Not used in edit
    });
    setSelectedPart(part);
    setShowForm('edit');
  };

  const openStockModal = (part: Part, type: 'add' | 'remove') => {
    setSelectedPart(part);
    setStockQuantity('');
    setShowStockModal(type);
  };

  const filteredParts = parts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && parts.length === 0) {
    return <div className="text-center py-8 text-gray-500 font-medium italic animate-pulse">Carregando estoque...</div>;
  }

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header and Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <input
            type="text"
            placeholder="Buscar por nome ou SKU..."
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="text-xs text-gray-500 font-bold bg-blue-50 px-4 py-2.5 rounded-full border border-blue-100 uppercase tracking-widest flex items-center gap-2 justify-center flex-1 md:flex-none">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            {filteredParts.length} Produtos
          </div>
          {isAdmin && (
            <Button onClick={openCreateForm} className="shadow-md flex-1 md:flex-none whitespace-nowrap">
              + Adicionar Produto
            </Button>
          )}
        </div>
      </div>

      {/* List of Parts (Table) */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Produto</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">SKU</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">Estoque</th>
              {isAdmin && <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Preço Venda</th>}
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredParts.map(part => (
              <tr key={part.id} className={`hover:bg-blue-50/30 transition-colors ${part.currentStock <= 5 ? 'bg-orange-50/30' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900 uppercase">{part.name}</div>
                  {part.currentStock <= 5 && <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">Estoque Baixo</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{part.sku}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`text-lg font-black ${part.currentStock <= 5 ? 'text-orange-600' : 'text-gray-800'}`}>
                    {part.currentStock}
                  </span>
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600">
                    {formatCurrency(part.sellingPrice)}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                  <button 
                    onClick={() => openStockModal(part, 'remove')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-md text-[10px] font-black uppercase tracking-widest border border-orange-100 transition-colors"
                    title="Dar saída em peça para uso em OS"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
                    Saída
                  </button>
                  {isAdmin && (
                    <>
                      <button 
                        onClick={() => openStockModal(part, 'add')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-md text-[10px] font-black uppercase tracking-widest border border-green-100 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Entrada
                      </button>
                      <button 
                        onClick={() => openEditForm(part)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-primary rounded-md text-[10px] font-black uppercase tracking-widest border border-gray-200 transition-colors"
                      >
                        Editar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {filteredParts.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    <p className="font-medium italic">Nenhum produto encontrado.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE / EDIT FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                {showForm === 'create' ? 'Adicionar Novo Produto' : 'Editar Produto'}
              </h3>
              <button onClick={() => setShowForm(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSavePart} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Nome da Peça</label>
                  <input 
                    autoFocus
                    placeholder="Ex: Filtro de Óleo Gol 1.0"
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border uppercase font-bold text-gray-900"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Código SKU</label>
                  <input 
                    placeholder="Ex: FO-1234"
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border uppercase font-mono text-gray-900"
                    value={formData.sku}
                    onChange={e => setFormData({...formData, sku: e.target.value.toUpperCase()})}
                    required
                  />
                </div>
                {showForm === 'create' && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Estoque Inicial</label>
                    <input 
                      type="number"
                      min="0"
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border font-bold text-gray-900"
                      value={formData.initialStock}
                      onChange={e => setFormData({...formData, initialStock: e.target.value})}
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Custo (R$)</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border text-gray-900"
                    value={formData.costPrice}
                    onChange={e => setFormData({...formData, costPrice: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Margem de Lucro (%)</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number"
                      step="0.01"
                      min="0"
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border text-gray-900 font-bold"
                      value={formData.margin}
                      onChange={e => setFormData({...formData, margin: e.target.value})}
                      required
                    />
                    <span className="text-[10px] text-gray-500 font-bold whitespace-nowrap bg-gray-50 px-2 py-2 rounded border border-gray-200">
                      = {formatCurrency(parseFloat(formData.costPrice || '0') * (1 + parseFloat(formData.margin || '0') / 100))}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-50 mt-2">
                <Button type="button" variant="secondary" onClick={() => setShowForm(null)} className="w-full">Cancelar</Button>
                <Button type="submit" variant="primary" className="w-full">Salvar Produto</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD/REMOVE STOCK MODAL */}
      {showStockModal && selectedPart && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
            <div className={`px-6 py-4 border-b border-gray-100 flex justify-between items-center ${showStockModal === 'add' ? 'bg-green-50' : 'bg-orange-50'}`}>
              <h3 className={`text-sm font-black uppercase ${showStockModal === 'add' ? 'text-green-800' : 'text-orange-800'}`}>
                {showStockModal === 'add' ? 'Entrada de Estoque' : 'Dar Saída (Uso em OS)'}
              </h3>
              <button onClick={() => setShowStockModal(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleStockAction} className="p-6 space-y-4">
              <div className="bg-gray-50 p-3 rounded border border-gray-100">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Produto</p>
                <p className="text-sm font-black text-gray-900 uppercase">{selectedPart.name}</p>
                <p className="text-[10px] font-mono text-gray-500">Estoque atual: {selectedPart.currentStock}</p>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                  Quantidade a {showStockModal === 'add' ? 'adicionar' : 'retirar'}
                </label>
                <input 
                  autoFocus
                  type="number"
                  min="1"
                  max={showStockModal === 'remove' ? selectedPart.currentStock : undefined}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-3 border font-black text-xl text-center"
                  value={stockQuantity}
                  onChange={e => setStockQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Button 
                  type="submit" 
                  variant="primary" 
                  className={`w-full font-black uppercase tracking-widest py-3 ${showStockModal === 'add' ? '!bg-green-600 hover:!bg-green-700' : '!bg-orange-500 hover:!bg-orange-600'}`}
                >
                  Confirmar {showStockModal === 'add' ? 'Entrada' : 'Saída'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowStockModal(null)} className="w-full">Cancelar</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default InventoryDashboard;
