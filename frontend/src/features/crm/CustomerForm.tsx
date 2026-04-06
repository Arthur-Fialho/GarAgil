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
      // Aqui poderíamos adicionar um tratamento de erro mais complexo
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {successMsg && <div style={{ color: 'green', marginBottom: '10px' }}>{successMsg}</div>}
      <div>
        <label htmlFor="name">Nome Completo</label>
        <input 
          id="name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          disabled={isLoading}
        />
        {errors.name && <span style={{ color: 'red' }}>{errors.name}</span>}
      </div>
      <div>
        <label htmlFor="document">CPF ou CNPJ</label>
        <input 
          id="document" 
          value={document} 
          onChange={(e) => setDocument(e.target.value)} 
          disabled={isLoading}
        />
        {errors.document && <span style={{ color: 'red' }}>{errors.document}</span>}
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Aguarde...' : 'Cadastrar Cliente'}
      </Button>
    </form>
  );
};

export default CustomerForm;
