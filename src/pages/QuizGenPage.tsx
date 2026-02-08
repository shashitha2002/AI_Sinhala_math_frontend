import React from 'react';
import QuizGenerator from '../components/Quiz/QuizGenerator';
import { useAuthContext } from '../contexts/AuthContext';

const QuizGenPage: React.FC = () => {
    const { user } = useAuthContext();
    return <QuizGenerator user={user} />;
};

export default QuizGenPage;
