import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import api from "../api/axios";
import type { User, AuthContextType } from "../types";
import {
  isNonEmpty,
  isStrongPassword,
  isValidEmail,
} from "../utils/validators";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch (error) {
      console.log(error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    if (!isValidEmail(email)) {
      throw new Error("Invalid email address");
    }

    if (!isStrongPassword(password)) {
      throw new Error("Password must be at least 4 characters");
    }

    await api.post("/auth/login", { email, password });
    // After login, fetch user data
    const userResponse = await api.get("/auth/me");
    setUser(userResponse.data.user);
  };

  const register = async (
    fullName: string,
    email: string,
    password: string
  ) => {
    if (!isNonEmpty(fullName)) {
      throw new Error("Full name is required");
    }

    if (fullName.length < 2) {
      throw new Error("Full name must be at least 2 characters");
    }

    if (!isValidEmail(email)) {
      throw new Error("Invalid email address");
    }

    if (!isStrongPassword(password)) {
      throw new Error("Password must be at least 4 characters");
    }

    await api.post("/auth/register", { fullName, email, password });
    // After registration, fetch user data
    const userResponse = await api.get("/auth/me");
    setUser(userResponse.data.user);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // Ignore logout errors
      console.log(error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
