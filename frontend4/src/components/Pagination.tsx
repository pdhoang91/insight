import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const renderPageNumbers = () => {
    const pages = [];
    
    // Always show first page
    pages.push(1);
    
    // Show current page and surrounding pages
    if (currentPage > 3) {
      pages.push('...');
    }
    
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }
    
    if (currentPage < totalPages - 2) {
      pages.push('...');
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="flex justify-between items-center gap-5 pt-5 border-t border-[#eaecf0]">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-2 text-sm font-medium text-[#667085] hover:text-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.67">
          <path d="M15.833 10H4.167"/>
          <path d="M10 4.167 4.167 10l5.833 5.833"/>
        </svg>
        Previous
      </button>

      {/* Page Numbers */}
      <div className="flex gap-0.5">
        {renderPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' ? onPageChange(page) : undefined}
            disabled={typeof page !== 'number'}
            className={`
              w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg
              ${page === currentPage 
                ? 'bg-[#f9f5ff] text-[#7f56d9]' 
                : 'text-[#667085] hover:bg-gray-50'
              }
              ${typeof page !== 'number' ? 'cursor-default' : 'cursor-pointer'}
            `}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-2 text-sm font-medium text-[#667085] hover:text-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.67">
          <path d="M4.167 10h11.666"/>
          <path d="M10 4.167 15.833 10l-5.833 5.833"/>
        </svg>
      </button>
    </div>
  );
};

export default Pagination; 