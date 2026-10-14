import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { API_BASE_URL } from "@/lib/api";
import { onAuthStateChanged, User } from "firebase/auth";

export interface UserProfile {
  id: number;
  firebase_uid: string;
  email: string;
  name: string;
  role: string;
  age?: number;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  idToken: string | null;
  refreshProfile: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  idToken: null,
  refreshProfile: async () => null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState<string | null>(null);

  const fetchProfile = async (firebaseUser: User): Promise<UserProfile | null> => {
    if (!API_BASE_URL) {
      return {
        id: 0,
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        name: firebaseUser.displayName || "User",
        role: "child",
        created_at: new Date().toISOString(),
      };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me?firebase_uid=${firebaseUser.uid}`);
      if (res.ok) {
        const data = await res.json();
        return data;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Exposed so Auth.tsx can force-refresh after signup
  const refreshProfile = async (): Promise<UserProfile | null> => {
    if (!user) return null;
    const p = await fetchProfile(user);
    setProfile(p);
    return p;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken().catch(() => null);
        setIdToken(token);
        const p = await fetchProfile(firebaseUser);
        setProfile(p);
      } else {
        setIdToken(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, idToken, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
