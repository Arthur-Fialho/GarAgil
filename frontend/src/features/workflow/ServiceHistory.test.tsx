import { render, screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import ServiceHistory from './ServiceHistory';

const mockHistoryOrders = [
  { id: '1', vehiclePlate: 'ABC-1234', description: 'Troca de Óleo', status: 4 }, // Finalizado
  { id: '2', vehiclePlate: 'XYZ-9876', description: 'Revisão', status: 5 }, // Cancelado
];

const server = setupServer(
  http.get('*/serviceorders', () => {
    return HttpResponse.json(mockHistoryOrders);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ServiceHistory Component', () => {
  it('should render the table headers in pt-BR', async () => {
    render(<ServiceHistory />);
    
    expect(await screen.findByText(/placa do veículo/i)).toBeInTheDocument();
    expect(screen.getByText(/descrição do serviço/i)).toBeInTheDocument();
    expect(screen.getByText(/status/i)).toBeInTheDocument();
  });

  it('should load and display finalized and canceled service orders', async () => {
    render(<ServiceHistory />);
    
    // Check if the mock orders are displayed
    expect(await screen.findByText('ABC-1234')).toBeInTheDocument();
    expect(await screen.findByText('Troca de Óleo')).toBeInTheDocument();
    expect(await screen.findByText('Finalizado')).toBeInTheDocument();

    expect(await screen.findByText('XYZ-9876')).toBeInTheDocument();
    expect(await screen.findByText('Revisão')).toBeInTheDocument();
    expect(await screen.findByText('Cancelado')).toBeInTheDocument();
  });
});
