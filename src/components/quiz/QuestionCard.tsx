import React from 'react';
import type { Question } from '../../types/api';
import { MathDisplay } from '../math/MathDisplay';

type QuestionCardProps = {
  question: Question;
  className?: string;
};

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, className }) => {
  return (
    <div className={className}>
      <p style={{ fontFamily: 'Iskoola Pota, Noto Sans Sinhala, sans-serif' }}>{question.text}</p>
      <MathDisplay expression={question.expression} />
    </div>
  );
};

export default QuestionCard;
