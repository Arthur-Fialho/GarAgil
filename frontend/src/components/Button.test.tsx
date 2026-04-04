import { render, screen } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  it('should render the button with correct text in pt-BR', () => {
    render(<Button>Salvar Dados</Button>);
    const buttonElement = screen.getByRole('button', { name: /salvar dados/i });
    expect(buttonElement).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Aguarde...</Button>);
    const buttonElement = screen.getByRole('button', { name: /aguarde\.\.\./i });
    expect(buttonElement).toBeDisabled();
  });
});
