import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import TaxInvoiceButton from './TaxInvoiceButton';

describe('TaxInvoiceButton Component', () => {
  it('should render the button with correct pt-BR text for product invoice (NF-e)', () => {
    render(<TaxInvoiceButton type="product" onIssue={vi.fn()} />);
    expect(screen.getByRole('button', { name: /emitir nf-e/i })).toBeInTheDocument();
  });

  it('should render the button with correct pt-BR text for service invoice (NFS-e)', () => {
    render(<TaxInvoiceButton type="service" onIssue={vi.fn()} />);
    expect(screen.getByRole('button', { name: /emitir nfs-e/i })).toBeInTheDocument();
  });

  it('should call onIssue function when clicked', async () => {
    const handleIssueMock = vi.fn();
    render(<TaxInvoiceButton type="service" onIssue={handleIssueMock} />);
    
    const button = screen.getByRole('button', { name: /emitir nfs-e/i });
    await userEvent.click(button);

    expect(handleIssueMock).toHaveBeenCalledTimes(1);
  });
});
