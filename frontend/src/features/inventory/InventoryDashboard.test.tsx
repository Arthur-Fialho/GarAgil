import { render, screen } from '@testing-library/react';
import InventoryDashboard from './InventoryDashboard';

const mockParts = [
  { id: '1', name: 'Filtro de Óleo', sku: 'FO-1234', stock: 10 },
  { id: '2', name: 'Vela de Ignição', sku: 'VI-001', stock: 2 }, // Low stock
];

describe('InventoryDashboard Component', () => {
  it('should render the inventory table headers in pt-BR', () => {
    render(<InventoryDashboard parts={[]} />);
    
    expect(screen.getByText(/nome da peça/i)).toBeInTheDocument();
    expect(screen.getByText(/código sku/i)).toBeInTheDocument();
    expect(screen.getByText(/estoque atual/i)).toBeInTheDocument();
  });

  it('should display a low stock alert for items with stock below 5 in pt-BR', () => {
    render(<InventoryDashboard parts={mockParts} />);
    
    // Vela de Ignição has stock = 2, so it should trigger the alert
    const alertElement = screen.getByText(/estoque baixo/i);
    expect(alertElement).toBeInTheDocument();
    
    // Filtro de Óleo has stock = 10, should not show warning
    const row = screen.getByText('Filtro de Óleo').closest('tr');
    expect(row?.textContent).not.toMatch(/estoque baixo/i);
  });
});
