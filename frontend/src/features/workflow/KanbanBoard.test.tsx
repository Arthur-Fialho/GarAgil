import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import KanbanBoard from './KanbanBoard';

const mockOrders = [
  { id: '1', vehiclePlate: 'ABC-1234', description: 'Troca de Óleo', status: 0, isNfEmitted: false }, // Orçamento
  { id: '2', vehiclePlate: 'XYZ-9876', description: 'Revisão', status: 1, isNfEmitted: false }, // Aprovado
];

const server = setupServer(
  http.get('*/serviceorders', () => {
    return HttpResponse.json(mockOrders);
  }),
  http.post('*/serviceorders', async () => {
    return HttpResponse.json({ id: '999', vehiclePlate: 'XYZ-1234', description: 'Revisão', status: 0, isNfEmitted: false }, { status: 201 });
  }),
  http.patch('*/serviceorders/:id/status', async ({ request, params }) => {
    const { id } = params;
    const body = await request.json() as any;
    return HttpResponse.json({ id, status: body.status, isNfEmitted: false });
  }),
  http.post('*/serviceorders/:id/emit-nf', async ({ params }) => {
    const { id } = params;
    return HttpResponse.json({ id, status: 3, isNfEmitted: true });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('KanbanBoard Component', () => {
  it('should render the 4 columns in pt-BR', async () => {
    render(<KanbanBoard />);
    
    expect(await screen.findByText(/orçamento/i)).toBeInTheDocument();
    expect(screen.getByText(/aprovado/i)).toBeInTheDocument();
    expect(screen.getByText(/em manutenção/i)).toBeInTheDocument();
    expect(screen.getByText(/pronto/i)).toBeInTheDocument();
  });

  it('should load and display service orders', async () => {
    render(<KanbanBoard />);
    
    // Check if the mock orders are displayed
    expect(await screen.findByText('ABC-1234')).toBeInTheDocument();
    expect(await screen.findByText('Troca de Óleo')).toBeInTheDocument();
    expect(await screen.findByText('XYZ-9876')).toBeInTheDocument();
  });
});
