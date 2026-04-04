import React, { useState } from 'react';
import Button from '../../components/Button';

interface MessageTemplateEditorProps {
  onSave: (template: string) => void;
}

const MessageTemplateEditor: React.FC<MessageTemplateEditorProps> = ({ onSave }) => {
  const [template, setTemplate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(template);
    setTemplate('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="message-template">Modelo de Mensagem</label>
        <textarea
          id="message-template"
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          placeholder="Ex: Olá, sua revisão está pronta"
          rows={4}
        />
      </div>
      <Button type="submit">Salvar Modelo</Button>
    </form>
  );
};

export default MessageTemplateEditor;
