import React from 'react';
import QuizTaking from '../components/Quiz/QuizTaking';
import { useAuthContext } from '../contexts/AuthContext';

const MathQuizPage: React.FC = () => {
    const { user } = useAuthContext();
    return <QuizTaking user={user} />;
};

export default MathQuizPage;
