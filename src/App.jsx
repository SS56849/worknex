import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import JobSearchPage from './pages/JobSearchPage';
import JobDetailsPage from './pages/JobDetailsPage';
import AuthPage from './pages/AuthPage';
import JobSeekerProfilePage from './pages/JobSeekerProfilePage';
import EmployerProfilePage from './pages/EmployerProfilePage';
import PostJobPage from './pages/PostJobPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import EmployerJobsPage from './pages/EmployerJobsPage';
import InfoPage from './pages/InfoPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/jobs" element={<JobSearchPage />} />
              <Route path="/jobs/:id" element={<JobDetailsPage />} />
              <Route path="/login" element={<AuthPage defaultMode="login" />} />
              <Route path="/register" element={<AuthPage defaultMode="register" />} />
              <Route path="/auth" element={<AuthPage />} />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['job_seeker', 'admin']}>
                    <JobSeekerProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applications"
                element={
                  <ProtectedRoute allowedRoles={['job_seeker', 'admin']}>
                    <MyApplicationsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/employer/profile"
                element={
                  <ProtectedRoute allowedRoles={['employer', 'admin']}>
                    <EmployerProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/jobs"
                element={
                  <ProtectedRoute allowedRoles={['employer', 'admin']}>
                    <EmployerJobsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/post-job"
                element={
                  <ProtectedRoute allowedRoles={['employer', 'admin']}>
                    <PostJobPage />
                  </ProtectedRoute>
                }
              />

              <Route path="/pricing" element={<InfoPage page="pricing" />} />
              <Route path="/about" element={<InfoPage page="about" />} />
              <Route path="/privacy" element={<InfoPage page="privacy" />} />
              <Route path="/terms" element={<InfoPage page="terms" />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
