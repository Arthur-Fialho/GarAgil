import React from 'react';
import Button from '../../components/Button';

interface TaxInvoiceButtonProps {
  type: 'product' | 'service';
  onIssue: () => void;
}

const TaxInvoiceButton: React.FC<TaxInvoiceButtonProps> = ({ type, onIssue }) => {
  const label = type === 'product' ? 'Emitir NF-e' : 'Emitir NFS-e';
  const variant = type === 'product' ? 'primary' : 'success';

  return (
    <Button onClick={onIssue} variant={variant} className="w-full sm:w-auto shadow-md hover:shadow-lg">
      <svg className="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {label}
    </Button>
  );
};

export default TaxInvoiceButton;
