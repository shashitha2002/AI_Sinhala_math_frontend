import React from 'react';
import ProgressTracker from '../components/Progress/ProgressTracker';
import { useAuthContext } from '../contexts/AuthContext';

const ProgressPage: React.FC = () => {
    const { user } = useAuthContext();
    return <ProgressTracker user={user} />;
};

export default ProgressPage;
