'use client';

import React from 'react';
import { useLibrary } from '../context/LibraryContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useLibrary();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-[#9B2915] shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-[#9B2915] shrink-0" />,
          info: <Info className="w-5 h-5 text-[#524F4A] shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-[#9B2915] shrink-0" />,
        };

        const borderStyles = {
          success: 'border-[#D29F96] bg-[#EBE3D4] text-[#1A1917]',
          error: 'border-[#9B2915] bg-[#EBE3D4] text-[#1A1917]',
          info: 'border-[#C8C1B4] bg-[#EBE3D4] text-[#1A1917]',
          warning: 'border-[#9B2915] bg-[#EBE3D4] text-[#1A1917]',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border-2 shadow-coletivo-card transition-all ${
              borderStyles[toast.type || 'success']
            }`}
          >
            {icons[toast.type || 'success']}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-[#1A1917] leading-snug">{toast.title}</h4>
              <p className="text-xs text-[#524F4A] mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#524F4A] hover:text-[#1A1917] transition-colors p-1 rounded-lg cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
