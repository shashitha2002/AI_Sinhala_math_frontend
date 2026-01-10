import React from 'react';

export const LoadingSpinner: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={className} aria-label="Loading" role="status">Loading...</div>;
};

export default LoadingSpinner;
