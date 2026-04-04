import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CustomerForm from './CustomerForm';

describe('CustomerForm Component', () => {
  it('should render the form with pt-BR labels', () => {
    render(<CustomerForm />);
    
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cpf ou cnpj/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cadastrar cliente/i })).toBeInTheDocument();
  });

  it('should show required field validation messages in pt-BR when submitting empty', async () => {
    render(<CustomerForm />);
    
    const submitButton = screen.getByRole('button', { name: /cadastrar cliente/i });
    await userEvent.click(submitButton);

    expect(await screen.findByText(/o nome é obrigatório/i)).toBeInTheDocument();
    expect(await screen.findByText(/documento inválido/i)).toBeInTheDocument();
  });
});
