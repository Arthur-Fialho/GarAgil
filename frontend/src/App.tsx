import React, { useState } from 'react';
import CustomerForm from './features/crm/CustomerForm';
import KanbanBoard from './features/workflow/KanbanBoard';
import InventoryDashboard from './features/inventory/InventoryDashboard';
import TaxInvoiceButton from './features/financial/TaxInvoiceButton';
import MessageTemplateEditor from './features/communication/MessageTemplateEditor';

type Tab = 'workflow' | 'crm' | 'inventory' | 'financial' | 'communication';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('workflow');

  const mockParts = [
    { id: '1', name: 'Filtro de Óleo', sku: 'FO-1234', stock: 15 },
    { id: '2', name: 'Vela de Ignição', sku: 'VI-001', stock: 3 }, // Estoque Baixo
    { id: '3', name: 'Correia Dentada', sku: 'CD-987', stock: 8 },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'workflow':
        return (
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="px-6 py-5 border-b border-gray-100 bg-white">
              <h3 className="text-xl font-semibold text-gray-800">Workflow: Kanban de Serviços</h3>
              <p className="text-sm text-gray-500 mt-1">Gerencie as ordens de serviço arrastando entre as colunas.</p>
            </div>
            <div className="p-6 bg-gray-50/50 flex-grow overflow-x-auto">
              <KanbanBoard />
            </div>
          </div>
        );
      case 'history':
        return (
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="px-6 py-5 border-b border-gray-100 bg-white">
              <h3 className="text-xl font-semibold text-gray-800">Serviços Finalizados</h3>
              <p className="text-sm text-gray-500 mt-1">Histórico completo de veículos que já passaram pela oficina.</p>
            </div>
            <div className="p-6 bg-gray-50/50 flex-grow overflow-x-auto">
              <ServiceHistory />
            </div>
          </div>
        );
      case 'crm':
        return (
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden max-w-2xl">
            <div className="px-6 py-5 border-b border-gray-100 bg-white">
              <h3 className="text-xl font-semibold text-gray-800">CRM: Novo Cliente</h3>
              <p className="text-sm text-gray-500 mt-1">Cadastre novos clientes e seus veículos na oficina.</p>
            </div>
            <div className="p-6">
              <CustomerForm />
            </div>
          </div>
        );
      case 'inventory':
        return (
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-white">
              <h3 className="text-xl font-semibold text-gray-800">Estoque: Controle de Peças</h3>
              <p className="text-sm text-gray-500 mt-1">Acompanhe o nível de estoque e alertas de reposição.</p>
            </div>
            <div className="p-6">
              <InventoryDashboard parts={mockParts} />
            </div>
          </div>
        );
      case 'financial':
        return (
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden max-w-2xl">
            <div className="px-6 py-5 border-b border-gray-100 bg-white">
              <h3 className="text-xl font-semibold text-gray-800">Financeiro: Emissão Fiscal</h3>
              <p className="text-sm text-gray-500 mt-1">Emita notas fiscais de produto (NF-e) ou serviço (NFS-e) rapidamente.</p>
            </div>
            <div className="p-6 flex flex-col sm:flex-row gap-4">
              <TaxInvoiceButton type="product" onIssue={() => alert('Emitindo NF-e (Produto)...')} />
              <TaxInvoiceButton type="service" onIssue={() => alert('Emitindo NFS-e (Serviço)...')} />
            </div>
          </div>
        );
      case 'communication':
        return (
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden max-w-2xl">
            <div className="px-6 py-5 border-b border-gray-100 bg-white">
              <h3 className="text-xl font-semibold text-gray-800">Comunicação: Mensagens WhatsApp</h3>
              <p className="text-sm text-gray-500 mt-1">Configure modelos de mensagem para a IA enviar aos clientes.</p>
            </div>
            <div className="p-6">
              <MessageTemplateEditor onSave={(template) => alert(`Modelo salvo: ${template}`)} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-sans text-gray-900">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10 md:min-h-screen">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 text-primary">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.7 14.3L21.7 15.3L19.7 13.3L20.7 12.3C20.8 12.2 20.9 12.1 21.1 12.1C21.2 12.1 21.4 12.2 21.5 12.3L22.8 13.6C22.9 13.8 22.9 14.1 22.7 14.3M13 19.9V22H15.1L21.2 15.9L19.2 13.9L13 19.9M11.6 15.6C10 16.3 8.3 16.5 6.7 16.2L11 11.9L9 9.9L4.7 14.2C4.1 12.3 4.4 10.3 5.4 8.7L2.4 5.7C2 5.3 2 4.7 2.4 4.3C2.8 3.9 3.4 3.9 3.8 4.3L6.8 7.3C9.3 5.3 12.9 5.2 15.6 6.8L12.5 9.9L14.6 11.9L17.7 8.8C18.6 10.7 18.3 12.8 17.1 14.4L18.6 15.9L20 14.5C20.6 13.1 20.8 11.5 20.3 10C20.2 9.5 20 9 19.7 8.6L22.3 6C22.7 5.6 22.7 5 22.3 4.6C21.9 4.2 21.3 4.2 20.9 4.6L18.2 7.2C17.4 6 16.2 5 14.8 4.4C12.4 3.4 9.6 3.6 7.4 5L4.4 2C4 1.6 3.4 1.6 3 2C2.6 2.4 2.6 3 3 3.4L6 6.4C4.3 8.8 4.2 12.1 5.6 14.6L2.6 17.6C2.2 18 2.2 18.6 2.6 19C3 19.4 3.6 19.4 4 19L7 16C8.8 17.1 10.8 17.3 12.8 16.8L11.6 15.6Z" />
            </svg>
            <h1 className="text-2xl font-bold tracking-tight">GarAgil</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1 font-medium tracking-wide uppercase">Oficina Inteligente</p>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {[
            { id: 'workflow', label: 'Workflow (Kanban)', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { id: 'history', label: 'Serviços Finalizados', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            { id: 'crm', label: 'Clientes (CRM)', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
            { id: 'inventory', label: 'Estoque de Peças', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
            { id: 'financial', label: 'Financeiro & Notas', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            { id: 'communication', label: 'Comunicação', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === item.id 
                  ? 'bg-blue-50 text-primary border border-blue-100 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
              }`}
            >
              <svg className={`w-5 h-5 ${activeTab === item.id ? 'text-primary' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}
        </nav>
        
        {/* User Profile Stub */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold shadow-inner">
            AF
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-800">Admin Oficina</span>
            <span className="text-xs text-gray-500">Oficina Modelo</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top bar for mobile / general contextual actions */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 shadow-sm shrink-0">
          <h2 className="text-lg font-medium text-gray-800 capitalize hidden md:block">
            {activeTab.replace('-', ' ')}
          </h2>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              <span className="w-2 h-2 mr-1.5 bg-green-500 rounded-full"></span>
              Sistema Online
            </span>
          </div>
        </header>

        {/* Dynamic View */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {renderContent()}
          </div>
        </div>
      </main>

    </div>
  );
}

export default App;
