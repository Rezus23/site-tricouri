import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/admin/dashboard"); // Sau '/' dacă e client
    } catch (err: any) {
      setError("Email sau parolă incorectă.");
    } finally {
      setLoading(false);
    }
  };

  // Clase pentru input: Fundal ALB și Text NEGRU ca să se vadă sigur
  const inputClassName = "w-full p-4 rounded-lg bg-white text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium placeholder-gray-500";

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Head>
        <title>Autentificare - Passion4Jerseys</title>
      </Head>

      <div className="bg-[#111] p-8 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)] w-full max-w-md border border-gray-800">
        <h1 className="text-3xl font-black text-white text-center mb-2 uppercase tracking-tighter">
          Bine ai revenit
        </h1>
        <p className="text-gray-400 text-center mb-8 text-sm">
          Intră în cont pentru a administra magazinul.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-400 text-xs font-bold uppercase mb-2 ml-1">
              Email
            </label>
            <input
              type="email"
              placeholder="exemplu@email.com"
              className={inputClassName} // 👈 AICI E FIX-UL
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-bold uppercase mb-2 ml-1">
              Parolă
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className={inputClassName} // 👈 AICI E FIX-UL
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-gray-200 transition transform active:scale-95 disabled:opacity-50 mt-4 uppercase tracking-wide"
          >
            {loading ? "Se verifică..." : "Autentificare"}
          </button>
        </form>

        <div className="mt-6 text-center">
            <Link href="/" className="text-gray-500 hover:text-white text-sm transition">
                ← Înapoi la Magazin
            </Link>
        </div>
      </div>
    </div>
  );
}