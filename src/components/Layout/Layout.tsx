import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuthContext } from '../../contexts/AuthContext';

const Layout: React.FC = () => {
    const { user, logout } = useAuthContext();

    // Provide a fallback user if null to prevent crash before redirect, 
    // though ProtectedRoute should handle this.
    const safeUser = user || { name: 'Guest' };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navbar user={safeUser} onLogout={logout} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
