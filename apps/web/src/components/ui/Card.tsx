import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', id }) => {
  return (
    <div
      id={id}
      className={`bg-white border border-slate-200 rounded-xl p-6 shadow-xs ${className}`}
    >
      {children}
    </div>
  );
};
