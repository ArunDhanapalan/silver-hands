import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { LocationProvider } from './context/LocationContext';
import AppShell from './components/layout/AppShell';
import LoadingSpinner from './components/common/LoadingSpinner';
import AccessibilityBar from './components/common/AccessibilityBar';
import ErrorBoundary from './components/common/ErrorBoundary';

// Pages
import HomePage from './pages/HomePage';

// Lazy loaded page components
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const WelcomeLanguagePage = lazy(() => import('./pages/WelcomeLanguagePage'));
const SeniorDashboardPage = lazy(() => import('./pages/SeniorDashboardPage'));
const SeniorOnboardingPage = lazy(() => import('./pages/SeniorOnboardingPage'));
const SeniorOrdersPage = lazy(() => import('./pages/SeniorOrdersPage'));
const SeniorEarningsPage = lazy(() => import('./pages/SeniorEarningsPage'));
const StorePage = lazy(() => import('./pages/StorePage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const CompanyDashboardPage = lazy(() => import('./pages/CompanyDashboardPage'));
const CartPage = lazy(() => import('./pages/CartPage'));

// Protected Route Guard
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner message="Checking security credentials..." />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <LocationProvider>
          <AuthProvider>
            <AppShell>
              <ErrorBoundary>
                <Suspense fallback={<LoadingSpinner message="Loading SilverHands module..." />}>
                  <Routes>
                    {/* Public & Customer Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/welcome" element={<WelcomeLanguagePage />} />
                    
                    {/* Store & Commerce */}
                    <Route path="/store" element={<StorePage />} />
                    <Route path="/store/:id" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    
                    {/* Managed Services */}
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/services/:id" element={<ServiceDetailPage />} />
                    
                    {/* Community & Regional Collab */}
                    <Route path="/community" element={<CommunityPage />} />

                    {/* Senior Citizen Space */}
                    <Route 
                      path="/senior" 
                      element={
                        <ProtectedRoute allowedRoles={['senior']}>
                          <SeniorDashboardPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/opportunities" 
                      element={
                        <ProtectedRoute allowedRoles={['senior']}>
                          <SeniorDashboardPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/senior/onboarding" 
                      element={<SeniorOnboardingPage />} 
                    />
                    <Route 
                      path="/senior/orders" 
                      element={
                        <ProtectedRoute allowedRoles={['senior']}>
                          <SeniorOrdersPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/senior/earnings" 
                      element={
                        <ProtectedRoute allowedRoles={['senior']}>
                          <SeniorEarningsPage />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Company / Job Provider Space */}
                    <Route 
                      path="/company" 
                      element={
                        <ProtectedRoute allowedRoles={['company']}>
                          <CompanyDashboardPage />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                  <AccessibilityBar />
                </Suspense>
              </ErrorBoundary>
            </AppShell>
          </AuthProvider>
        </LocationProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
