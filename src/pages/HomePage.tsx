import React from 'react';
import { useGenerator } from '../hooks/useGenerator';
import LoadingSpinner from '../components/common/LoadingSpinner';
import QuestionCard from '../components/quiz/QuestionCard';

export const HomePage: React.FC = () => {
  const { loading, data } = useGenerator();

  if (loading) return <LoadingSpinner />;
  if (!data) return <div>No question available.</div>;

  return (
    <div>
      <h1>සිංහල ගණිත ප්‍රශ්න</h1>
      <QuestionCard question={data} />
    </div>
  );
};

export default HomePage;
