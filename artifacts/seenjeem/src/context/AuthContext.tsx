import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthUser {
  id: number;
  username: string;
  displayName: string | null;
  isAdmin: boolean;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (username: string, password: string) => Promise<{ isAdmin: boolean }>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE = "/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("rakez-auth-token");
    if (savedToken) {
      setToken(savedToken);
      fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((r) => {
          if (r.status === 401 || r.status === 403) {
            localStorage.removeItem("rakez-auth-token");
            setToken(null);
            setIsLoading(false);
            return null;
          }
          return r.json();
        })
        .then((data) => {
          if (!data) return;
          if (data.user) setUser(data.user);
        })
        .catch(() => {
          /* خطأ شبكة — نحافظ على التوكن ونحاول مرة ثانية */
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  async function login(username: string, password: string): Promise<{ isAdmin: boolean }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "خطأ في تسجيل الدخول");
    localStorage.setItem("rakez-auth-token", data.token);
    setToken(data.token);
    setUser(data.user);
    return { isAdmin: data.user.isAdmin };
  }

  async function register(username: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "خطأ في إنشاء الحساب");
    localStorage.setItem("rakez-auth-token", data.token);
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("rakez-auth-token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
