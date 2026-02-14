import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ModelPaperTaking from '../components/Quiz/ModelPaperTaking';
import { useAuthContext } from '../contexts/AuthContext';

const ModelPaperTakePage: React.FC = () => {
    const { user } = useAuthContext();
    const location = useLocation();
    const navigate = useNavigate();
    const { generatedPaper } = location.state || {};

    useEffect(() => {
        // Redirect back if no generated paper
        if (!generatedPaper) {
            console.warn('No generated paper found, redirecting to generator');
            navigate('/quiz/model-paper');
        }
    }, [generatedPaper, navigate]);

    // Show loading while checking
    if (!generatedPaper) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="text-lg">Loading...</div>
        </div>;
    }

    return <ModelPaperTaking user={user} generatedPaper={generatedPaper} />;
};

export default ModelPaperTakePage;
