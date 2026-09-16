import React from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children, className = '', id }) => {
  return (
    <main id={id || 'page-wrapper'} className={`flex-1 w-full ${className}`}>
      {children}
    </main>
  );
};
