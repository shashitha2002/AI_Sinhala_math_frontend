import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Assuming useTranslation hook usage, check imports
// Reverting to existing hook if it's custom, but ideally generic
// The original code imported from './hooks/useTranslation'
import { useTranslation as useCustomTranslation } from './hooks/useTranslation';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import apiClient from './services/apiClient'; // Import to ensure interceptors are registered

import LoginPage from './pages/LoginPage'; // Will need to refactor these to TSX later or allow JS imports
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import QuizGenerator from './components/Quiz/QuizGenerator';
import QuizTaking from './components/Quiz/QuizTaking';
import Forum from './components/Forum/Forum';
import ForumPost from './components/Forum/ForumPost';
import ProgressTracker from './components/Progress/ProgressTracker';
import Portfolio from './components/Progress/Portfolio';
import GameDashboard from './components/Games/GameDashboard';
import BadgesPage from './components/Badges/BadgesPage';
import Navbar from './components/Layout/Navbar';
// MathQuizTaking was importing QuizTaking.js, so same component
import StressIndicator from './components/Stress/StressIndicator';
import ModelPaperTaking from './components/Quiz/ModelPaperTaking';
import './App.css';

// Existing useTranslation hook seems to return { t }, so I will keep using it.
// If it was react-i18next, usage is similar.

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <AppContentWrapper />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

function AppContentWrapper() {
    const { user, loading, logout, login } = useAuthContext();
    const { t } = useCustomTranslation();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">{t('common.loading')}</div>
            </div>
        );
    }

    return <AppContent user={user} onLogout={logout} onLogin={login} />;
}

// Keeping the AppContent structure but Props typed
// Since I haven't converted components to TS yet, 'any' is safe for now to avoid compilation errors on imports.
// But ideally I should just pass what they need.
function AppContent({ user, onLogout, onLogin }: { user: any, onLogout: any, onLogin: any }) {
    const location = useLocation();
    const isQuizTakingPage = location.pathname.startsWith('/quiz/take/');

    return (
        <div className="App min-h-screen bg-dominant-50 dark:bg-dominant-950 transition-colors duration-200">
            {user && !isQuizTakingPage && <Navbar user={user} onLogout={onLogout} />}

            <main className={isQuizTakingPage ? "" : "pb-8"}>
                {user && !isQuizTakingPage && <StressIndicator userId={user._id} />}

                <Routes>
                    <Route
                        path="/login"
                        element={!user ? <LoginPage /> : <Navigate to="/dashboard" />}
                    />
                    <Route
                        path="/register"
                        element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />}
                    />

                    <Route
                        path="/dashboard"
                        element={user ? <DashboardPage user={user} /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/quiz/generate"
                        element={user ? <QuizGenerator user={user} /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/quiz/take/:quizId"
                        element={user ? <QuizTaking user={user} /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/forum"
                        element={user ? <Forum user={user} /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/forum/post/:postId"
                        element={user ? <ForumPost user={user} /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/progress"
                        element={user ? <ProgressTracker user={user} /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/portfolio"
                        element={user ? <Portfolio user={user} /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/games"
                        element={user ? <GameDashboard user={user} /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/badges"
                        element={user ? <BadgesPage user={user} /> : <Navigate to="/login" />}
                    />
                    <Route path="/quiz/math" element={<QuizTaking user={user} />} />
                    <Route
                        path="/"
                        element={<Navigate to={user ? "/dashboard" : "/login"} />}
                    />
                    <Route path="/quiz/model-paper" element={<ModelPaperTaking user={user} />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
