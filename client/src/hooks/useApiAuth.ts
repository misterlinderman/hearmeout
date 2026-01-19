import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useCallback, useState } from 'react';
import api from '../services/api';

export const useApiAuth = () => {
  const { getAccessTokenSilently, isAuthenticated, isLoading, user } = useAuth0();
  const [isTokenSet, setIsTokenSet] = useState(false);
  const [isUserSynced, setIsUserSynced] = useState(false);

  const setApiToken = useCallback(async () => {
    if (isAuthenticated && !isLoading && user) {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        });
        api.setToken(token);
        setIsTokenSet(true);
        
        // Sync user to database (creates user if doesn't exist)
        try {
          await api.syncUser({
            email: user.email || '',
            name: user.name || user.nickname || '',
            picture: user.picture,
          });
          setIsUserSynced(true);
        } catch (syncError) {
          console.error('Error syncing user:', syncError);
          // Still allow app to function even if sync fails
          setIsUserSynced(true);
        }
      } catch (error) {
        console.error('Error getting access token:', error);
        api.setToken(null);
        setIsTokenSet(false);
        setIsUserSynced(false);
      }
    } else if (!isAuthenticated && !isLoading) {
      api.setToken(null);
      setIsTokenSet(false);
      setIsUserSynced(false);
    }
  }, [getAccessTokenSilently, isAuthenticated, isLoading, user]);

  useEffect(() => {
    setApiToken();
  }, [setApiToken]);

  return {
    isReady: !isLoading && ((isTokenSet && isUserSynced) || !isAuthenticated),
    refreshToken: setApiToken,
  };
};

export default useApiAuth;
