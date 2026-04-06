import React, { useState } from 'react';
import Button from '../../components/Button';
import api from '../../services/api';

const CustomerForm: React.FC = () => {
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [errors, setErrors] = useState({ name: '', document: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    const newErrors = { name: '', document: '' };
    if (!name) newErrors.name = 'O nome é obrigatório';
    if (!document) newErrors.document = 'Documento inválido';
    setErrors(newErrors);

    if (newErrors.name || newErrors.document) {
      return;
    }

    try {
      setIsLoading(true);
      await api.post('/customers', { name, document });
      setSuccessMsg('Cliente cadastrado com sucesso!');
      setName('');
      setDocument('');
    } catch (error) {
      console.error('Erro ao cadastrar cliente', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {successMsg && (
        <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-md">
          {successMsg}
        </div>
      )}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
        <input 
          id="name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          disabled={isLoading}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:ring-primary focus:border-primary border-gray-300 px-3 py-2 border ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>
      
      <div>
        <label htmlFor="document" className="block text-sm font-medium text-gray-700">CPF ou CNPJ</label>
        <input 
          id="document" 
          value={document} 
          onChange={(e) => setDocument(e.target.value)} 
          disabled={isLoading}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:ring-primary focus:border-primary border-gray-300 px-3 py-2 border ${errors.document ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
        />
        {errors.document && <p className="mt-1 text-sm text-red-600">{errors.document}</p>}
      </div>
      
      <div className="pt-2">
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? 'Aguarde...' : 'Cadastrar Cliente'}
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm;
