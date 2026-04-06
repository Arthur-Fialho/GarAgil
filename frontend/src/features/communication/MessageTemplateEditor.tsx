import React, { useState } from 'react';
import Button from '../../components/Button';

interface MessageTemplateEditorProps {
  onSave: (template: string) => void;
}

const MessageTemplateEditor: React.FC<MessageTemplateEditorProps> = ({ onSave }) => {
  const [template, setTemplate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!template.trim()) return;
    onSave(template);
    setTemplate('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="message-template" className="block text-sm font-medium text-gray-700">
          Modelo de Mensagem (WhatsApp)
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <textarea
            id="message-template"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            placeholder="Ex: Olá, sua revisão está pronta"
            rows={4}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm px-3 py-2 border resize-none"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Esta mensagem será enviada automaticamente pela nossa IA baseada nos gatilhos configurados.
        </p>
      </div>
      <div className="flex justify-end">
        <Button type="submit" variant="success" className="w-full sm:w-auto" disabled={!template.trim()}>
          Salvar Modelo
        </Button>
      </div>
    </form>
  );
};

export default MessageTemplateEditor;
