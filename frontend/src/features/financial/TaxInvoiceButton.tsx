import React from 'react';
import Button from '../../components/Button';

interface TaxInvoiceButtonProps {
  type: 'product' | 'service';
  onIssue: () => void;
}

const TaxInvoiceButton: React.FC<TaxInvoiceButtonProps> = ({ type, onIssue }) => {
  const label = type === 'product' ? 'Emitir NF-e' : 'Emitir NFS-e';

  return (
    <Button onClick={onIssue} className="tax-invoice-btn">
      {label}
    </Button>
  );
};

export default TaxInvoiceButton;
