import React from 'react';
import CustomerForm from './features/crm/CustomerForm';
import InventoryDashboard from './features/inventory/InventoryDashboard';
import TaxInvoiceButton from './features/financial/TaxInvoiceButton';
import MessageTemplateEditor from './features/communication/MessageTemplateEditor';

function App() {
  const mockParts = [
    { id: '1', name: 'Filtro de Óleo', sku: 'FO-1234', stock: 15 },
    { id: '2', name: 'Vela de Ignição', sku: 'VI-001', stock: 3 }, // Estoque Baixo
    { id: '3', name: 'Correia Dentada', sku: 'CD-987', stock: 8 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white px-6 py-5 border-b border-gray-200 shadow-sm rounded-lg sm:flex sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              GarAgil Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Protótipo de Interface (Tailwind CSS)
            </p>
          </div>
        </div>

        <main className="space-y-8">
          
          {/* CRM Section */}
          <section className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">1. CRM: Cadastro de Cliente</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="max-w-xl">
                <CustomerForm />
              </div>
            </div>
          </section>

          {/* Inventory Section */}
          <section className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">2. Estoque: Dashboard de Peças</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <InventoryDashboard parts={mockParts} />
            </div>
          </section>

          {/* Financial Section */}
          <section className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">4. Financeiro: Emissão de Notas</h3>
            </div>
            <div className="px-4 py-5 sm:p-6 flex flex-col sm:flex-row gap-4">
              <TaxInvoiceButton type="product" onIssue={() => alert('Emitindo NF-e (Produto)...')} />
              <TaxInvoiceButton type="service" onIssue={() => alert('Emitindo NFS-e (Serviço)...')} />
            </div>
          </section>

          {/* Communication Section */}
          <section className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">4. Comunicação: Editor de Mensagem WhatsApp</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="max-w-xl">
                <MessageTemplateEditor onSave={(template) => alert(`Modelo salvo: ${template}`)} />
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}

export default App;
