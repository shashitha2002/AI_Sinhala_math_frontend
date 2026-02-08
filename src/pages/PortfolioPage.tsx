import React from 'react';
import Portfolio from '../components/Progress/Portfolio';
import { useAuthContext } from '../contexts/AuthContext';

const PortfolioPage: React.FC = () => {
    const { user } = useAuthContext();
    return <Portfolio user={user} />;
};

export default PortfolioPage;
