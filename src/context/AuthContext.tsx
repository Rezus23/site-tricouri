import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

// 1. Definim tipul contextului (Adăugăm 'loading')
type AuthContextType = {
  user: User | null;
  loading: boolean; // 👈 AICI ERA LIPSA
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true, // Default este true
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // 👈 Starea de încărcare

  useEffect(() => {
    // Ascultăm schimbările de la Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false); // 👈 Când Firebase răspunde, oprim loading-ul
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};