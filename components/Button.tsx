import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "font-bold py-3 px-6 rounded-2xl transition-all transform active:scale-95 duration-100 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-black text-white shadow-cartoon hover:shadow-cartoon-hover active:shadow-cartoon-active active:translate-y-1 hover:-translate-y-0.5 border-2 border-black",
    secondary: "bg-white text-black border-2 border-black shadow-cartoon hover:shadow-cartoon-hover active:shadow-cartoon-active active:translate-y-1 hover:-translate-y-0.5",
    danger: "bg-red-500 text-white border-2 border-red-700 shadow-cartoon hover:shadow-cartoon-hover active:shadow-cartoon-active",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};