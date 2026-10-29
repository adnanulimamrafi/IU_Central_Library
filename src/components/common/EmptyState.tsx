import React from 'react';
import { BookOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white/60 dark:bg-charcoal-900/60 rounded-2xl border border-dashed border-sage-300 dark:border-charcoal-700 my-6">
      <div className="p-4 bg-sage-100 dark:bg-charcoal-800 text-forest-700 dark:text-sage-200 rounded-2xl mb-4 shadow-xs">
        {icon || <BookOpen className="w-8 h-8 opacity-70" />}
      </div>
      <h3 className="text-base font-semibold text-charcoal-900 dark:text-ivory-100 mb-1">
        {title}
      </h3>
      <p className="text-sm text-charcoal-500 dark:text-sage-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-forest-700 hover:bg-forest-800 text-ivory-100 text-xs font-semibold rounded-xl shadow-xs transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
