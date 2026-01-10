import React from 'react';

export type MathDisplayProps = {
  expression: string;
  className?: string;
};

export const MathDisplay: React.FC<MathDisplayProps> = ({ expression, className }) => {
  // Placeholder: integrate KaTeX/MathJax later
  return <span className={className}>{expression}</span>;
};

export default MathDisplay;
