import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import CustomerForm from './CustomerForm';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock the API endpoint
const server = setupServer(
  http.post('*/customers', async () => {
    return HttpResponse.json({ id: '123', name: 'Maria Silva' }, { status: 201 });
  }),
  http.post('*/customers/:id/vehicles', async () => {
    return HttpResponse.json({ id: '456', plate: 'XYZ-1234', model: 'Honda Civic' }, { status: 201 });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CustomerForm Component', () => {
  it('should render the form with pt-BR labels', () => {
    render(
      <AuthProvider>
        <CustomerForm />
      </AuthProvider>
    );
    
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cpf ou cnpj/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cadastrar cliente/i })).toBeInTheDocument();
  });

  it('should show required field validation messages in pt-BR when submitting empty', async () => {
    render(
      <AuthProvider>
        <CustomerForm />
      </AuthProvider>
    );
    
    const submitButton = screen.getByRole('button', { name: /cadastrar cliente/i });
    await userEvent.click(submitButton);

    expect(await screen.findByText(/o nome é obrigatório/i)).toBeInTheDocument();
    expect(await screen.findByText(/documento inválido/i)).toBeInTheDocument();
  });

  it('should call the API, show success message, and allow adding a vehicle', async () => {
    render(
      <AuthProvider>
        <CustomerForm />
      </AuthProvider>
    );

    await userEvent.type(screen.getByLabelText(/nome completo/i), 'Maria Silva');
    await userEvent.type(screen.getByLabelText(/cpf ou cnpj/i), '123.456.789-00');
    
    const submitButton = screen.getByRole('button', { name: /cadastrar cliente/i });
    await userEvent.click(submitButton);

    // Assert that success message is shown
    expect(await screen.findByText(/cliente cadastrado com sucesso! agora você pode vincular veículos/i)).toBeInTheDocument();

    // Now the vehicle form should be visible
    expect(screen.getByLabelText(/placa do veículo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/modelo/i)).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/placa do veículo/i), 'XYZ-1234');
    await userEvent.type(screen.getByLabelText(/modelo/i), 'Honda Civic');
    
    const addVehicleButton = screen.getByRole('button', { name: /adicionar veículo/i });
    await userEvent.click(addVehicleButton);

    expect(await screen.findByText(/veículo vinculado com sucesso!/i)).toBeInTheDocument();
  });
});
