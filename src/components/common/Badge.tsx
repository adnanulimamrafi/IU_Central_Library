import React from 'react';

interface BadgeProps {
  variant?: 'available' | 'borrowed' | 'due-soon' | 'overdue' | 'active' | 'suspended' | 'admin' | 'member' | 'default';
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  let variantClasses = 'bg-sage-100 text-charcoal-700 dark:bg-charcoal-800 dark:text-sage-200';

  switch (variant) {
    case 'available':
      variantClasses =
        'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50';
      break;
    case 'borrowed':
      variantClasses =
        'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50';
      break;
    case 'due-soon':
      variantClasses =
        'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-700/60 font-medium';
      break;
    case 'overdue':
      variantClasses =
        'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50 font-medium';
      break;
    case 'active':
      variantClasses =
        'bg-forest-50 text-forest-700 border border-forest-200 dark:bg-forest-900/40 dark:text-forest-200 dark:border-forest-700';
      break;
    case 'suspended':
      variantClasses =
        'bg-gray-100 text-gray-700 border border-gray-300 dark:bg-charcoal-800 dark:text-gray-400 dark:border-charcoal-600';
      break;
    case 'admin':
      variantClasses =
        'bg-forest-700 text-ivory-100 border border-forest-600 font-semibold tracking-wide uppercase text-[10px]';
      break;
    case 'member':
      variantClasses =
        'bg-sage-200 text-forest-800 border border-sage-300 dark:bg-forest-900 dark:text-sage-100';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${sizeClasses} ${variantClasses} ${className}`}
    >
      {variant === 'available' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
      {variant === 'overdue' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>}
      {children}
    </span>
  );
};
