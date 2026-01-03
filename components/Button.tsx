import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "font-bold rounded-2xl transition-all transform active:scale-95 duration-100 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-black text-white shadow-cartoon hover:shadow-cartoon-hover active:shadow-cartoon-active active:translate-y-1 hover:-translate-y-0.5 border-2 border-black",
    secondary: "bg-white text-black border-2 border-black shadow-cartoon hover:shadow-cartoon-hover active:shadow-cartoon-active active:translate-y-1 hover:-translate-y-0.5",
    danger: "bg-red-500 text-white border-2 border-red-700 shadow-cartoon hover:shadow-cartoon-hover active:shadow-cartoon-active",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
  };

  const sizes = {
    sm: "py-2 px-4 text-sm",
    md: "py-3 px-6 text-base",
    lg: "py-4 px-8 text-lg",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};