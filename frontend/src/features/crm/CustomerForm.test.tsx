import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import CustomerForm from './CustomerForm';

// Mock the API endpoint
const server = setupServer(
  http.post('*/customers', async () => {
    return HttpResponse.json({ id: '123', name: 'Maria Silva' }, { status: 201 });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

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

  it('should call the API and show a success message when submitting valid data', async () => {
    render(<CustomerForm />);

    await userEvent.type(screen.getByLabelText(/nome completo/i), 'Maria Silva');
    await userEvent.type(screen.getByLabelText(/cpf ou cnpj/i), '123.456.789-00');
    
    const submitButton = screen.getByRole('button', { name: /cadastrar cliente/i });
    await userEvent.click(submitButton);

    // Assert that success message is shown
    expect(await screen.findByText(/cliente cadastrado com sucesso/i)).toBeInTheDocument();
  });
});
