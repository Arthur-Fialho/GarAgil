import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import MessageTemplateEditor from './MessageTemplateEditor';

describe('MessageTemplateEditor Component', () => {
  it('should render the editor with pt-BR labels and placeholders', () => {
    render(<MessageTemplateEditor onSave={vi.fn()} />);
    
    expect(screen.getByLabelText(/modelo de mensagem/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ex: olá, sua revisão está pronta/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /salvar modelo/i })).toBeInTheDocument();
  });

  it('should call onSave with the template text when submitted', async () => {
    const handleSaveMock = vi.fn();
    render(<MessageTemplateEditor onSave={handleSaveMock} />);
    
    const textarea = screen.getByLabelText(/modelo de mensagem/i);
    await userEvent.type(textarea, 'Mensagem de teste do WhatsApp');
    
    const saveButton = screen.getByRole('button', { name: /salvar modelo/i });
    await userEvent.click(saveButton);

    expect(handleSaveMock).toHaveBeenCalledWith('Mensagem de teste do WhatsApp');
  });
});
