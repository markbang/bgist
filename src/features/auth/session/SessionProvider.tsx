import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {
  pollGitHubDeviceAccessToken,
  requestGitHubDeviceAuthorization,
  type GitHubDeviceAuthorization,
} from '../api/oauth';
import {clearSession, readSession, saveSession, StoredSession} from '../storage/secureSessionStore';
import {setApiAccessToken} from '../../../shared/api/client';
import {getUserInfo} from '../../gists/api/gists';

type SessionStatus = 'loading' | 'signedOut' | 'signedIn';

type SessionContextValue = {
  status: SessionStatus;
  user: StoredSession['user'] | null;
  accessToken: string | null;
  signIn: (options?: {onVerification?: (authorization: GitHubDeviceAuthorization) => void}) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({children}: {children: React.ReactNode}) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<StoredSession['user'] | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const stored = await readSession();
        if (!mounted) {
          return;
        }

        if (stored) {
          setAccessToken(stored.accessToken);
          setUser(stored.user);
          setApiAccessToken(stored.accessToken);
          setStatus('signedIn');
          return;
        }

        setStatus('signedOut');
      } catch {
        if (!mounted) {
          return;
        }

        setApiAccessToken(null);
        setAccessToken(null);
        setUser(null);
        setStatus('signedOut');
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      user,
      accessToken,
      async signIn(options) {
        const authorization = await requestGitHubDeviceAuthorization();
        options?.onVerification?.(authorization);
        const authState = await pollGitHubDeviceAccessToken(authorization);
        setApiAccessToken(authState.accessToken);

        try {
          const currentUser = await getUserInfo();
          const nextSession = {
            accessToken: authState.accessToken,
            user: {
              login: currentUser.login,
              avatar_url: currentUser.avatar_url,
              name: currentUser.name,
            },
          };

          await saveSession(nextSession);
          queryClient.clear();
          setApiAccessToken(nextSession.accessToken);
          setAccessToken(nextSession.accessToken);
          setUser(nextSession.user);
          setStatus('signedIn');
        } catch (error) {
          setApiAccessToken(null);
          throw error;
        }
      },
      async signOut() {
        await clearSession();
        queryClient.clear();
        setApiAccessToken(null);
        setAccessToken(null);
        setUser(null);
        setStatus('signedOut');
      },
    }),
    [accessToken, queryClient, status, user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error('useSession must be used inside SessionProvider');
  }
  return value;
}
