import * as Keychain from 'react-native-keychain';

const SERVICE = 'com.bgist.session';

export type StoredSession = {
  accessToken: string;
  user: {
    login: string;
    avatar_url?: string;
    name?: string | null;
  };
};

export async function saveSession(session: StoredSession) {
  await Keychain.setGenericPassword('oauth', JSON.stringify(session), {
    service: SERVICE,
  });
}

export async function readSession(): Promise<StoredSession | null> {
  const value = await Keychain.getGenericPassword({service: SERVICE});
  if (!value) {
    return null;
  }
  return JSON.parse(value.password) as StoredSession;
}

export async function clearSession() {
  await Keychain.resetGenericPassword({service: SERVICE});
}
