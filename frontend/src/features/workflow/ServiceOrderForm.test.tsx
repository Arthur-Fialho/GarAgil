import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { vi } from 'vitest';
import ServiceOrderForm from './ServiceOrderForm';

const server = setupServer(
  http.post('*/serviceorders', async () => {
    return HttpResponse.json({ id: '999', vehiclePlate: 'XYZ-1234', vehicleModel: 'Civic', description: 'Revisão', status: 0 }, { status: 201 });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ServiceOrderForm Component', () => {
  it('should render the toggle button initially', () => {
    render(<ServiceOrderForm onSuccess={vi.fn()} />);
    expect(screen.getByRole('button', { name: /nova ordem de serviço/i })).toBeInTheDocument();
  });

  it('should expand form and validate empty inputs in pt-BR', async () => {
    render(<ServiceOrderForm onSuccess={vi.fn()} />);
    
    // Expand form
    await userEvent.click(screen.getByRole('button', { name: /nova ordem de serviço/i }));

    expect(screen.getByLabelText(/placa do veículo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/modelo do veículo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descrição do serviço/i)).toBeInTheDocument();

    // Submit empty
    await userEvent.click(screen.getByRole('button', { name: /salvar ordem/i }));

    expect(await screen.findByText(/a placa do veículo é obrigatória/i)).toBeInTheDocument();
    expect(await screen.findByText(/o modelo do veículo é obrigatório/i)).toBeInTheDocument();
    expect(await screen.findByText(/a descrição do serviço é obrigatória/i)).toBeInTheDocument();
  });

  it('should submit successfully and call onSuccess', async () => {
    const onSuccessMock = vi.fn();
    render(<ServiceOrderForm onSuccess={onSuccessMock} />);

    // Expand
    await userEvent.click(screen.getByRole('button', { name: /nova ordem de serviço/i }));

    // Fill form
    await userEvent.type(screen.getByLabelText(/placa do veículo/i), 'XYZ-1234');
    await userEvent.type(screen.getByLabelText(/modelo do veículo/i), 'Civic 2.0');
    await userEvent.type(screen.getByLabelText(/descrição do serviço/i), 'Revisão Geral');

    // Submit
    await userEvent.click(screen.getByRole('button', { name: /salvar ordem/i }));

    // Wait for the mock API to return and check if the callback was fired
    await waitFor(() => {
      expect(onSuccessMock).toHaveBeenCalledTimes(1);
    });
  });
});
