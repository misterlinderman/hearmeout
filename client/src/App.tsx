import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { Toaster } from 'react-hot-toast';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Home from './pages/Home';
import Explore from './pages/Explore';
import Dashboard from './pages/Dashboard';
import IdeaSubmit from './pages/IdeaSubmit';
import IdeaDetail from './pages/IdeaDetail';
import IdeaEdit from './pages/IdeaEdit';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import Loading from './components/common/Loading';

// Hooks
import { useApiAuth } from './hooks/useApiAuth';

const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE;

function AppContent() {
  const { isReady } = useApiAuth();

  if (!isReady) {
    return <Loading fullScreen message="Initializing..." />;
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1c1917',
            color: '#fff',
            border: '1px solid #292524',
          },
          success: {
            iconTheme: {
              primary: '#f59e0b',
              secondary: '#1c1917',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#1c1917',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="explore" element={<Explore />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="submit"
            element={
              <ProtectedRoute>
                <IdeaSubmit />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          {/* Idea detail page */}
          <Route path="ideas/:id" element={<IdeaDetail />} />
          {/* Idea edit page - protected */}
          <Route
            path="ideas/:id/edit"
            element={
              <ProtectedRoute>
                <IdeaEdit />
              </ProtectedRoute>
            }
          />
          {/* Admin route - protected by email check in component */}
          <Route
            path="admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                <p className="text-stone-400">Page not found</p>
              </div>
            }
          />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <Auth0Provider
      domain={auth0Domain}
      clientId={auth0ClientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: auth0Audience,
      }}
      cacheLocation="localstorage"
    >
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Auth0Provider>
  );
}

export default App;
