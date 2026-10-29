import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Home, Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full bg-white dark:bg-charcoal-900 p-8 sm:p-10 rounded-3xl border border-sage-200 dark:border-charcoal-800 shadow-xl space-y-4">
        <div className="w-16 h-16 bg-sage-100 dark:bg-charcoal-800 text-forest-700 dark:text-amber-400 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8" />
        </div>
        <span className="text-4xl font-serif font-bold text-forest-900 dark:text-ivory-100 block">
          404
        </span>
        <h2 className="font-serif text-xl font-bold text-charcoal-900 dark:text-ivory-100">
          Page Not Catalogued
        </h2>
        <p className="text-xs text-charcoal-500 dark:text-sage-400 leading-relaxed">
          The requested shelf location or page does not exist in the library index. It may have been moved or archived.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
          <Link
            to="/"
            className="w-full sm:w-auto py-2.5 px-5 bg-forest-700 hover:bg-forest-800 text-ivory-100 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Library Home</span>
          </Link>
          <Link
            to="/books"
            className="w-full sm:w-auto py-2.5 px-5 bg-sage-100 hover:bg-sage-200 dark:bg-charcoal-800 text-forest-900 dark:text-ivory-100 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Search Books</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
