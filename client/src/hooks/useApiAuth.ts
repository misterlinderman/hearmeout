import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useCallback, useState } from 'react';
import api from '../services/api';

export const useApiAuth = () => {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();
  const [isTokenSet, setIsTokenSet] = useState(false);

  const setApiToken = useCallback(async () => {
    if (isAuthenticated && !isLoading) {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        });
        api.setToken(token);
        setIsTokenSet(true);
      } catch (error) {
        console.error('Error getting access token:', error);
        api.setToken(null);
        setIsTokenSet(false);
      }
    } else if (!isAuthenticated && !isLoading) {
      api.setToken(null);
      setIsTokenSet(false);
    }
  }, [getAccessTokenSilently, isAuthenticated, isLoading]);

  useEffect(() => {
    setApiToken();
  }, [setApiToken]);

  return {
    isReady: !isLoading && (isTokenSet || !isAuthenticated),
    refreshToken: setApiToken,
  };
};

export default useApiAuth;
