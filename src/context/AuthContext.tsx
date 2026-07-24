import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface UserSession {
  userId: string;
  name: string;
  email: string;
  authProvider: 'local' | 'google' | 'guest';
  token: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  isGuest: boolean;
  isLoggedIn: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  signupWithEmail: (firstName: string, lastName: string, email: string, pass: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<UserSession>;
  continueAsGuest: () => Promise<UserSession>;
  logout: () => void;
}

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data as T;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('sanisilver_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('sanisilver_user_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('sanisilver_user_session');
    }
  }, [user]);

  /* Login with Email & Password */
  const loginWithEmail = async (email: string, password: string): Promise<boolean> => {
    const data = await apiRequest<{ user: Omit<UserSession, 'token'>; token: string }>('/api/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    });
    const session: UserSession = { ...data.user, token: data.token };
    setUser(session);
    return true;
  };

  /* Sign up with Email & Password */
  const signupWithEmail = async (firstName: string, lastName: string, email: string, password: string): Promise<boolean> => {
    const data = await apiRequest<{ user: Omit<UserSession, 'token'>; token: string }>('/api/auth/signup', {
      method: 'POST', body: JSON.stringify({ firstName, lastName, email, password }),
    });
    const session: UserSession = { ...data.user, token: data.token };
    setUser(session);
    return true;
  };

  /* Continue as Google (Direct Google details) */
  const loginWithGoogle = async (): Promise<UserSession> => {
    const googleUserNames = ['Ayesha Khan', 'Zainab Ahmed', 'Hamza Malik', 'Sarah Ali'];
    const randomName = googleUserNames[Math.floor(Math.random() * googleUserNames.length)];
    const randomEmail = `${randomName.toLowerCase().replace(' ', '.')}@gmail.com`;
    const userId = `goog_${Math.floor(100000 + Math.random() * 900000)}`;

    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomName}`;
    const data = await apiRequest<{ user: Omit<UserSession, 'token'>; token: string }>('/api/auth/google', {
      method: 'POST', body: JSON.stringify({ name: randomName, email: randomEmail, googleId: userId, avatarUrl }),
    });
    const session: UserSession = { ...data.user, token: data.token };

    setUser(session);
    return session;
  };

  /* Continue as Guest (Unique Guest ID e.g. guest123456) */
  const continueAsGuest = async (): Promise<UserSession> => {
    const data = await apiRequest<{ user: Omit<UserSession, 'token'>; token: string }>('/api/auth/guest', {
      method: 'POST', body: JSON.stringify({}),
    });
    const session: UserSession = { ...data.user, token: data.token };

    setUser(session);
    return session;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sanisilver_user_session');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token: user?.token ?? null,
      isGuest: user?.authProvider === 'guest',
      isLoggedIn: !!user && user.authProvider !== 'guest',
      loginWithEmail,
      signupWithEmail,
      loginWithGoogle,
      continueAsGuest,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
