import React, { useState } from 'react';
import { generateSvgBookCover } from '../../utils/bookCovers';

interface BookCoverProps {
  src?: string;
  title: string;
  author: string;
  category?: string;
  className?: string;
  alt?: string;
}

export const BookCover: React.FC<BookCoverProps> = ({
  src,
  title,
  author,
  category = 'Academic Book',
  className = 'w-full h-full object-cover',
  alt,
}) => {
  const [hasError, setHasError] = useState(false);

  // Generate fallback SVG cover
  const fallbackSvg = generateSvgBookCover({
    title: title || 'Academic Textbook',
    author: author || 'Department of CSE',
    category,
  });

  const effectiveSrc = hasError || !src ? fallbackSvg : src;

  return (
    <img
      src={effectiveSrc}
      alt={alt || title}
      loading="lazy"
      onError={() => {
        if (!hasError) setHasError(true);
      }}
      className={className}
    />
  );
};
