import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/Auth/Login';
import QuizGenPage from './pages/QuizGenPage';
import PortfolioPage from './pages/PortfolioPage';
import ProgressPage from './pages/ProgressPage';
import MathQuizPage from './pages/MathQuizPage';
import ModelPaperPage from './pages/ModelPaperPage';
import QuizHistoryPage from './pages/QuizHistoryPage';
import { useAuth } from './hooks/useAuth';

import type { ReactNode } from 'react';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { loading } = useAuth(); // Assume useAuth handles initial token check logic
  // Simple check for token persistence to avoid flicker if useAuth runs async
  const token = localStorage.getItem('token');

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="quiz/generate" element={<QuizGenPage />} />
          <Route path="quiz/history" element={<QuizHistoryPage />} />
          <Route path="math-quiz" element={<MathQuizPage />} />
          <Route path="quiz/results/:quizId" element={<MathQuizPage />} />
          <Route path="quiz/take/:quizId" element={<MathQuizPage />} />
          <Route path="quiz/model-paper" element={<ModelPaperPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="progress" element={<ProgressPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
