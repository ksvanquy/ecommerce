import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'pill' | 'tab';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isActive?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isActive = false,
  className = '',
  disabled,
  id,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer';

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-xs rounded-lg',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400 rounded-lg',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-blue-500 bg-transparent rounded-lg',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 rounded-lg',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400 bg-transparent rounded-lg',
    pill: `rounded-full transition focus:ring-blue-500 ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
    }`,
    tab: `rounded-xl font-bold transition flex items-center gap-1.5 focus:ring-blue-500 ${
      isActive
        ? 'bg-blue-600 text-white shadow-xs'
        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
    }`,
  };

  const sizeStyles = {
    xs: 'px-2.5 py-1 text-xs',
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      id={id}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  );
};

