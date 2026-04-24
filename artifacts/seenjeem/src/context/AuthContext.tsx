import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthUser {
  id: number;
  username: string;
  displayName: string | null;
  isAdmin: boolean;
  role: string;
}

export type LoginResult =
  | { requiresOtp: false; isAdmin: boolean }
  | { requiresOtp: true; tempToken: string; phone: string };

export type RegisterResult =
  | { requiresOtp: false }
  | { requiresOtp: true; tempToken: string; phone: string };

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (username: string, password: string) => Promise<LoginResult>;
  register: (username: string, password: string, phone: string) => Promise<RegisterResult>;
  finalizeAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE = "/api";
const TIMEOUT_MS = 10000;

export function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("rakez-auth-token");
    if (!savedToken) { setIsLoading(false); return; }

    setToken(savedToken);
    fetchWithTimeout(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${savedToken}` },
    })
      .then((r) => {
        if (r.status === 401 || r.status === 403) {
          localStorage.removeItem("rakez-auth-token");
          setToken(null);
          return null;
        }
        return r.json();
      })
      .then((data) => { if (data?.user) setUser(data.user); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  async function login(username: string, password: string): Promise<LoginResult> {
    const res = await fetchWithTimeout(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }).catch(() => { throw new Error("تعذّر الاتصال بالخادم، تحقق من اتصالك وحاول مجدداً"); });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "خطأ في تسجيل الدخول");

    if (data.requiresOtp) {
      return { requiresOtp: true, tempToken: data.tempToken, phone: data.phone ?? "" };
    }

    localStorage.setItem("rakez-auth-token", data.token);
    setToken(data.token);
    setUser(data.user);
    return { requiresOtp: false, isAdmin: data.user.isAdmin };
  }

  async function register(username: string, password: string, phone: string): Promise<RegisterResult> {
    const res = await fetchWithTimeout(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, phone }),
    }).catch(() => { throw new Error("تعذّر الاتصال بالخادم، تحقق من اتصالك وحاول مجدداً"); });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "خطأ في إنشاء الحساب");

    if (data.requiresOtp) {
      return { requiresOtp: true, tempToken: data.tempToken, phone: data.phone ?? "" };
    }

    localStorage.setItem("rakez-auth-token", data.token);
    setToken(data.token);
    setUser(data.user);
    return { requiresOtp: false };
  }

  function finalizeAuth(tok: string, u: AuthUser) {
    localStorage.setItem("rakez-auth-token", tok);
    setToken(tok);
    setUser(u);
  }

  function logout() {
    localStorage.removeItem("rakez-auth-token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, finalizeAuth, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
