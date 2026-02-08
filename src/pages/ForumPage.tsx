import React from 'react';
import Forum from '../components/Forum/Forum';
import { useAuthContext } from '../contexts/AuthContext';

const ForumPage: React.FC = () => {
    const { user } = useAuthContext();
    return <Forum user={user} />;
};

export default ForumPage;
