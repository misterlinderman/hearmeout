import { useAuth0 } from '@auth0/auth0-react';
import { Navigate, useLocation } from 'react-router-dom';
import Loading from './Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'moderator' | 'admin';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const location = useLocation();

  if (isLoading) {
    return <Loading fullScreen message="Authenticating..." />;
  }

  if (!isAuthenticated) {
    // Redirect to login, but save the current location
    loginWithRedirect({
      appState: { returnTo: location.pathname },
    });
    return <Loading fullScreen message="Redirecting to login..." />;
  }

  // TODO: Add role checking once user roles are implemented
  // if (requiredRole) {
  //   // Check user role from context or API
  // }

  return <>{children}</>;
}
