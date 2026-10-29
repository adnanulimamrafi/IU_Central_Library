import React, { useState } from 'react';
import { Modal } from './Modal';
import { AlertCircle, CheckCircle2, Trash2, Loader2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'primary' | 'danger' | 'success';
  loading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'primary',
  loading: externalLoading = false,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = externalLoading || internalLoading;

  const handleConfirm = async () => {
    if (loading) return;
    try {
      setInternalLoading(true);
      await Promise.resolve(onConfirm());
      onClose();
    } catch (e) {
      console.error(e);
      onClose();
    } finally {
      setInternalLoading(false);
    }
  };

  let icon = <AlertCircle className="w-8 h-8 text-forest-600 dark:text-forest-400" />;
  let confirmButtonClass =
    'bg-forest-700 hover:bg-forest-800 text-ivory-100 dark:bg-forest-600 dark:hover:bg-forest-500';

  if (type === 'danger') {
    icon = <Trash2 className="w-8 h-8 text-rose-600 dark:text-rose-400" />;
    confirmButtonClass = 'bg-rose-600 hover:bg-rose-700 text-white';
  } else if (type === 'success') {
    icon = <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />;
    confirmButtonClass = 'bg-emerald-600 hover:bg-emerald-700 text-white';
  }

  return (
    <Modal isOpen={isOpen} onClose={loading ? () => {} : onClose} maxWidth="sm">
      <div className="flex flex-col items-center text-center pt-2">
        <div className="p-3 bg-sage-100 dark:bg-charcoal-800 rounded-full mb-4">
          {icon}
        </div>
        <h4 className="text-lg font-serif font-bold text-forest-900 dark:text-ivory-100 mb-2">
          {title}
        </h4>
        <p className="text-sm text-charcoal-600 dark:text-sage-300 leading-relaxed mb-6">
          {message}
        </p>

        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-sage-300 dark:border-charcoal-700 text-sm font-medium text-charcoal-700 dark:text-sage-200 hover:bg-sage-100 dark:hover:bg-charcoal-800 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all flex items-center justify-center gap-2 ${confirmButtonClass} disabled:opacity-70`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{loading ? 'Processing...' : confirmText}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
