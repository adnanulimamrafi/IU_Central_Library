import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useLibrary();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        let icon = <Info className="w-5 h-5 text-forest-600 flex-shrink-0" />;
        let borderColor = 'border-sage-300';
        let bgStyle = 'bg-white dark:bg-charcoal-900';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />;
          borderColor = 'border-emerald-200 dark:border-emerald-900/50';
        } else if (toast.type === 'error') {
          icon = <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />;
          borderColor = 'border-rose-200 dark:border-rose-900/50';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />;
          borderColor = 'border-amber-200 dark:border-amber-900/50';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border ${borderColor} ${bgStyle} transition-all duration-200 transform translate-y-0`}
            role="alert"
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-charcoal-900 dark:text-ivory-100">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="text-xs text-charcoal-600 dark:text-sage-300 mt-0.5 leading-relaxed">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-charcoal-400 hover:text-charcoal-700 dark:text-sage-400 dark:hover:text-ivory-100 p-0.5 rounded transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
