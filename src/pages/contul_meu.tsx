import { useAuth } from "@/context/AuthContext";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { signOut } from "firebase/auth";
import Link from "next/link";
import BlurredBackground from "@/components/BlurredBackground"; // 👈 IMPORT NOU

// Definește structura datelor
type Comanda = {
  id: string;
  createdAt: Timestamp; 
  amount: number; 
  status: string;
};

export default function ContulMeu() {
  const { user } = useAuth();
  const router = useRouter();
  const [comenzi, setComenzi] = useState<Comanda[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔒 CONFIGURARE ADMIN
  const ADMIN_EMAIL = "rezuscatalin@gmail.com"; 

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchComenzi = async () => {
      try {
        const q = query(
          collection(db, "orders"), 
          where("userId", "==", user.uid), 
          orderBy("createdAt", "desc") 
        );
        
        const snapshot = await getDocs(q);
        
        const data = snapshot.docs.map(doc => {
          const comandaData = doc.data() as Omit<Comanda, "id">;
          return {
            id: doc.id,
            ...comandaData
          };
        });
        
        setComenzi(data);
      } catch (error) {
        console.error("❌ Eroare la preluarea comenzilor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComenzi();
  }, [user, router]); 

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center relative">
              <BlurredBackground />
              <p className="text-xl text-white font-bold drop-shadow-md">Se încarcă datele...</p>
          </div>
      );
  }

  if (!user) return null; 

  return (
    <div className="min-h-screen relative">
      {/* 1. FUNDAL BLURAT */}
      <BlurredBackground />

      <div className="p-4 max-w-5xl mx-auto pt-10 relative z-10">
        
        {/* HEADER + BUTOANE */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b border-white/30 pb-4">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Contul Meu</h1>
          
          <div className="flex gap-4 mt-4 sm:mt-0">
              {/* 🔐 BUTON ADMIN */}
              {user.email === ADMIN_EMAIL && (
                  <Link 
                    href="/admin/dashboard"
                    className="bg-purple-600 text-white px-5 py-2 rounded hover:bg-purple-700 font-bold shadow-lg transition transform hover:scale-105"
                  >
                    ⚙️ Admin Panel
                  </Link>
              )}

              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700 font-medium shadow-lg transition transform hover:scale-105"
              >
                Ieși din cont
              </button>
          </div>
        </div>

        {/* TABEL COMENZI */}
        <h2 className="text-xl font-semibold mb-4 text-white drop-shadow-md">Istoric comenzi</h2>
        
        <div className="overflow-x-auto bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 text-left text-sm font-bold text-gray-700">ID Comandă</th>
                <th className="p-4 text-center text-sm font-bold text-gray-700">Data</th>
                <th className="p-4 text-center text-sm font-bold text-gray-700">Total</th>
                <th className="p-4 text-center text-sm font-bold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {comenzi.length > 0 ? (
                comenzi.map((comanda) => (
                  <tr key={comanda.id} className="hover:bg-blue-50 border-b last:border-b-0 transition duration-150">
                    <td className="p-4 text-sm font-mono text-gray-700 break-all">{comanda.id}</td>
                    <td className="p-4 text-center text-sm text-gray-600">
                      {(comanda.createdAt instanceof Timestamp)
                        ? comanda.createdAt.toDate().toLocaleDateString('ro-RO')
                        : "N/A"}
                    </td>
                    <td className="p-4 text-center font-bold text-gray-900 text-lg">
                      {comanda.amount?.toFixed(2) ?? '0.00'} RON
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                          comanda.status === 'completed' ? 'bg-green-100 text-green-700 border border-green-200' :
                          comanda.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                          'bg-gray-100 text-gray-700'
                      }`}>
                          {comanda.status === 'completed' ? 'Finalizată' : comanda.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-gray-500 text-lg">
                    Nu ai plasat nicio comandă încă.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}