import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import './i18n/config'
import { AuthProvider, useAuthContext } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import QuizGenPage from './pages/QuizGenPage';
import ForumPage from './pages/ForumPage';
import ProgressPage from './pages/ProgressPage';
import PortfolioPage from './pages/PortfolioPage';
import MathQuizPage from './pages/MathQuizPage';
import ModelPaperPage from './pages/ModelPaperPage';
import Layout from './components/Layout/Layout';
import BadgesPage from './pages/BadgesPage';
import QuizHistoryPage from './pages/QuizHistoryPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthContext();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};



const AppRoutes = () => {
  const { user } = useAuthContext();
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes wrapped in Layout */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage user={user} />
          </ProtectedRoute>
        } />
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* Add other protected routes here if they exist */}
        <Route path="/quiz/generate" element={
          <ProtectedRoute>
            <QuizGenPage />
          </ProtectedRoute>
        } />
        <Route path="/quiz/history" element={
          <ProtectedRoute>
            <QuizHistoryPage />
          </ProtectedRoute>
        } />
        <Route path="/forum" element={
          <ProtectedRoute>
            <ForumPage />
          </ProtectedRoute>
        } />
        <Route path="/progress" element={
          <ProtectedRoute>
            <ProgressPage />
          </ProtectedRoute>
        } />
        <Route path="/portfolio" element={
          <ProtectedRoute>
            <PortfolioPage />
          </ProtectedRoute>
        } />
        <Route path="/math-quiz" element={
          <ProtectedRoute>
            <MathQuizPage />
          </ProtectedRoute>
        } />
        <Route path="/quiz/take/:quizId" element={
          <ProtectedRoute>
            <MathQuizPage />
          </ProtectedRoute>
        } />
        <Route path="/quiz/model-paper" element={
          <ProtectedRoute>
            <ModelPaperPage />
          </ProtectedRoute>
        } />
        <Route path="/badges" element={
          <ProtectedRoute>
            <BadgesPage />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
