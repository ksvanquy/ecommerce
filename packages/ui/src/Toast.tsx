import React from 'react';
import { Toaster as SonnerToaster, toast } from 'sonner';

export type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

export const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <SonnerToaster
      position="bottom-right"
      richColors
      closeButton
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl group-[.toaster]:font-sans text-sm',
          description: 'group-[.toast]:text-slate-500',
          actionButton:
            'group-[.toast]:bg-blue-600 group-[.toast]:text-white font-medium',
          cancelButton:
            'group-[.toast]:bg-slate-100 group-[.toast]:text-slate-600',
        },
      }}
      {...props}
    />
  );
};

export { toast };
