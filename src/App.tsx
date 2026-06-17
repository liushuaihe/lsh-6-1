import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';
import { useAuthStore } from './store/useAuthStore.js';
import Login from './pages/Login.js';
import Dashboard from './pages/Dashboard.js';
import AchievementList from './pages/AchievementList.js';
import AchievementDetail from './pages/AchievementDetail.js';
import AchievementForm from './pages/AchievementForm.js';
import ReviewManagement from './pages/ReviewManagement.js';
import Statistics from './pages/Statistics.js';
import UserManagement from './pages/UserManagement.js';

function App() {
  const { token, fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchCurrentUser().catch(() => {});
    }
  }, [token]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/achievements" element={
          <ProtectedRoute>
            <Layout>
              <AchievementList />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/achievements/new" element={
          <ProtectedRoute>
            <Layout>
              <AchievementForm />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/achievements/:id" element={
          <ProtectedRoute>
            <Layout>
              <AchievementDetail />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/achievements/:id/edit" element={
          <ProtectedRoute>
            <Layout>
              <AchievementForm />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/review" element={
          <ProtectedRoute roles={['advisor', 'admin']}>
            <Layout>
              <ReviewManagement />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/statistics" element={
          <ProtectedRoute>
            <Layout>
              <Statistics />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/users" element={
          <ProtectedRoute roles={['admin']}>
            <Layout>
              <UserManagement />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
