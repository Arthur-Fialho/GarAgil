import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'success' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'border-transparent text-white bg-primary hover:bg-primary-hover focus:ring-primary',
    danger: 'border-transparent text-white bg-danger hover:bg-danger-hover focus:ring-danger',
    success: 'border-transparent text-white bg-success hover:bg-success-hover focus:ring-success',
    secondary: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
