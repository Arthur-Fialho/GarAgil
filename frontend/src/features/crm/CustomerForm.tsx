import React, { useState } from 'react';
import Button from '../../components/Button';

const CustomerForm: React.FC = () => {
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [errors, setErrors] = useState({ name: '', document: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = { name: '', document: '' };
    if (!name) newErrors.name = 'O nome é obrigatório';
    if (!document) newErrors.document = 'Documento inválido';
    setErrors(newErrors);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Nome Completo</label>
        <input 
          id="name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
        {errors.name && <span>{errors.name}</span>}
      </div>
      <div>
        <label htmlFor="document">CPF ou CNPJ</label>
        <input 
          id="document" 
          value={document} 
          onChange={(e) => setDocument(e.target.value)} 
        />
        {errors.document && <span>{errors.document}</span>}
      </div>
      <Button type="submit">Cadastrar Cliente</Button>
    </form>
  );
};

export default CustomerForm;
