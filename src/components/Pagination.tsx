import { Button } from '@radix-ui/themes';
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}

/**
 * Responsive pagination control replicating previous News component style.
 */
export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onChange }) => {
  if (totalPages <= 1) return null;

  const go = (p: number) => () => onChange(p);

  // Compute window of up to 5 pages around current page (with shifting for edges)
  const pages: number[] = [];
  const windowSize = Math.min(5, totalPages);
  const start = Math.max(1, Math.min(totalPages - windowSize + 1, currentPage - Math.floor(windowSize / 2)));
  for (let i = 0; i < windowSize; i++) {
    const page = start + i;
    if (page <= totalPages) pages.push(page);
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-8 mb-4">
      <Button variant="outline" disabled={currentPage === 1} onClick={go(currentPage - 1)}>上一页</Button>
      <div className="hidden sm:flex items-center gap-2">
        {pages[0] > 1 && (
          <>
            <Button variant="outline" onClick={go(1)}>1</Button>
            {pages[0] > 2 && <span className='text-gray-500'>...</span>}
          </>
        )}
        {pages.map(p => (
          <Button key={p} variant={p === currentPage ? 'solid' : 'outline'} onClick={go(p)}>{p}</Button>
        ))}
        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && <span className='text-gray-500'>...</span>}
            <Button variant="outline" onClick={go(totalPages)}>{totalPages}</Button>
          </>
        )}
      </div>
      <Button variant="outline" disabled={currentPage === totalPages} onClick={go(currentPage + 1)}>下一页</Button>
    </div>
  );
};
