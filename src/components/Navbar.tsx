import  { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function Navbar() {
  const { user } = useAuth(); // ← important
  return (
    <nav className="bg-white shadow-md px-4 py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
      <div className="text-xl font-bold text-blue-600 text-center sm:text-left">
        <Link href="/">🏆 Passion4Jerseys - Fotbal</Link>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-gray-800 text-base">
        <Link href="/">Home</Link>
        <Link href="/shop">Magazin</Link>
        <Link href="/cart">Coș</Link>

        {user ? (
          <Link href="/contul_meu">Contul meu</Link>
        ) : (
          <Link href="/login">Autentificare</Link>
        )}
      </div>
    </nav>
  );
}