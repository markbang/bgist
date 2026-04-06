import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {startGitHubOAuth} from '../api/oauth';
import {clearSession, readSession, saveSession, StoredSession} from '../storage/secureSessionStore';
import {setApiAccessToken} from '../../../shared/api/client';

type SessionStatus = 'loading' | 'signedOut' | 'signedIn';

type SessionContextValue = {
  status: SessionStatus;
  user: StoredSession['user'] | null;
  accessToken: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

async function fetchCurrentUser(token: string) {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!response.ok) {
    throw new Error('GITHUB_USER_FETCH_FAILED');
  }

  return response.json();
}

export function SessionProvider({children}: {children: React.ReactNode}) {
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
      async signIn() {
        const authState = await startGitHubOAuth();
        const currentUser = await fetchCurrentUser(authState.accessToken);
        const nextSession = {
          accessToken: authState.accessToken,
          user: {
            login: currentUser.login,
            avatar_url: currentUser.avatar_url,
            name: currentUser.name,
          },
        };
        await saveSession(nextSession);
        setApiAccessToken(nextSession.accessToken);
        setAccessToken(nextSession.accessToken);
        setUser(nextSession.user);
        setStatus('signedIn');
      },
      async signOut() {
        await clearSession();
        setApiAccessToken(null);
        setAccessToken(null);
        setUser(null);
        setStatus('signedOut');
      },
    }),
    [accessToken, status, user],
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
