import React from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children, className = '', id }) => {
  return (
    <main id={id || 'page-wrapper'} className={`flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full ${className}`}>
      {children}
    </main>
  );
};
