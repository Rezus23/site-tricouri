import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { auth } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from "firebase/auth";

export default function Login() {
  const router = useRouter();
  
  // Stare pentru a comuta între Login și Register
  const [isLogin, setIsLogin] = useState(true);
  
  // Date formular
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Doar pentru register
  const [nume, setNume] = useState(""); // Doar pentru register

  // Stări UI
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGICA DE LOGIN ---
        await signInWithEmailAndPassword(auth, email, password);
        // Redirecționare (poți schimba în /admin/dashboard dacă ești tu)
        router.push("/"); 
      } else {
        // --- LOGICA DE REGISTER ---
        if (password !== confirmPassword) {
            throw new Error("Parolele nu coincid.");
        }
        if (password.length < 6) {
            throw new Error("Parola trebuie să aibă minim 6 caractere.");
        }

        // Creăm contul
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Adăugăm numele utilizatorului la profil
        await updateProfile(userCredential.user, {
            displayName: nume
        });

        router.push("/");
      }
    } catch (err: any) {
      console.error(err);
      // Traducem erorile uzuale din Firebase
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
          setError("Email sau parolă incorectă.");
      } else if (err.code === 'auth/email-already-in-use') {
          setError("Acest email este deja folosit.");
      } else if (err.code === 'auth/weak-password') {
          setError("Parola este prea slabă.");
      } else {
          setError(err.message || "A apărut o eroare. Încearcă din nou.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Stil comun pentru input-uri (Vizibil: Scris Negru pe Fundal Alb)
  const inputClassName = "w-full p-4 rounded-lg bg-white text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium placeholder-gray-500 transition";

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Head>
        <title>{isLogin ? "Autentificare" : "Înregistrare"} - Passion4Jerseys</title>
      </Head>

      <div className="bg-[#111] p-8 md:p-10 rounded-3xl shadow-[0_0_40px_rgba(255,255,255,0.05)] w-full max-w-md border border-gray-800 relative overflow-hidden">
        
        {/* Titlu Dinamic */}
        <h1 className="text-3xl font-black text-white text-center mb-2 uppercase tracking-tighter">
          {isLogin ? "Bine ai revenit" : "Creează Cont"}
        </h1>
        <p className="text-gray-400 text-center mb-8 text-sm">
          {isLogin 
            ? "Intră în cont pentru a finaliza comanda mai rapid." 
            : "Alătură-te comunității Passion4Jerseys."}
        </p>

        {/* Mesaj Eroare */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-sm text-center font-bold animate-pulse">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          

          <div>
            <label className="block text-gray-400 text-xs font-bold uppercase mb-2 ml-1">Email</label>
            <input
              type="email"
              placeholder="exemplu@email.com"
              className={inputClassName}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-bold uppercase mb-2 ml-1">Parolă</label>
            <input
              type="password"
              placeholder="••••••••"
              className={inputClassName}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-gray-200 transition transform active:scale-95 disabled:opacity-50 mt-6 uppercase tracking-wide shadow-lg"
          >
            {loading 
                ? "Se procesează..." 
                : (isLogin ? "Autentificare" : "Înregistrează-te")
            }
          </button>
        </form>

        {/* --- TOGGLE (COMUTATOR) LOGIN / REGISTER --- */}
        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
            <p className="text-gray-400 text-sm">
                {isLogin ? "Nu ai cont încă?" : "Ai deja un cont?"}
            </p>
            <button 
                onClick={() => {
                    setIsLogin(!isLogin);
                    setError(""); // Resetăm erorile când schimbăm tab-ul
                }}
                className="text-white font-bold text-sm uppercase tracking-wider mt-2 hover:text-blue-500 transition border-b-2 border-transparent hover:border-blue-500"
            >
                {isLogin ? "Creează un cont nou" : "Intră în cont"}
            </button>
        </div>

        <div className="mt-4 text-center">
            <Link href="/" className="text-xs text-gray-600 hover:text-gray-400 transition">
                ← Înapoi la Magazin
            </Link>
        </div>
      </div>
    </div>
  );
}