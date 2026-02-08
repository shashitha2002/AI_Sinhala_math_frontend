import React from 'react';
import ModelPaperTaking from '../components/Quiz/ModelPaperTaking';
import { useAuthContext } from '../contexts/AuthContext';

const ModelPaperPage: React.FC = () => {
    const { user } = useAuthContext();
    return <ModelPaperTaking user={user} />;
};

export default ModelPaperPage;
