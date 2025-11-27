import { useAuth } from "@/context/AuthContext";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { signOut } from "firebase/auth";
import Link from "next/link"; // Import necesar pentru butonul de Admin

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
  const ADMIN_EMAIL = "rezuscatalin@gmail.com"; // Emailul tău de admin

  useEffect(() => {
    // 1. Redirect dacă nu e logat
    if (!user) {
      router.push("/login");
      return;
    }

    // 2. Preluare comenzi
    const fetchComenzi = async () => {
      try {
        const q = query(
          collection(db, "orders"), // Colecția corectă
          where("userId", "==", user.uid), // Filtrare după UID
          orderBy("createdAt", "desc") // Sortare după dată
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

  // Loading State
  if (loading) {
      return (
          <div className="p-8 text-center text-gray-500 min-h-screen flex items-center justify-center">
              Se încarcă datele...
          </div>
      );
  }

  if (!user) return null; 

  return (
    <div className="p-4 max-w-5xl mx-auto min-h-screen">
      
      {/* HEADER + BUTOANE */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">Contul Meu</h1>
        
        <div className="flex gap-4 mt-4 sm:mt-0">
            {/* 🔐 BUTON ADMIN - Apare doar pentru tine */}
            {user.email === ADMIN_EMAIL && (
                <Link 
                  href="/admin/dashboard"
                  className="bg-purple-600 text-white px-5 py-2 rounded hover:bg-purple-700 font-bold shadow-md transition"
                >
                  ⚙️ Admin Panel
                </Link>
            )}

            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700 font-medium shadow-md transition"
            >
              Ieși din cont
            </button>
        </div>
      </div>

      {/* TABEL COMENZI */}
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Istoric comenzi</h2>
      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-4 text-left text-sm font-semibold text-gray-600">ID Comandă</th>
              <th className="p-4 text-center text-sm font-semibold text-gray-600">Data</th>
              <th className="p-4 text-center text-sm font-semibold text-gray-600">Total</th>
              <th className="p-4 text-center text-sm font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {comenzi.length > 0 ? (
              comenzi.map((comanda) => (
                <tr key={comanda.id} className="hover:bg-gray-50 border-b last:border-b-0 transition">
                  <td className="p-4 text-sm font-mono text-gray-700 break-all">{comanda.id}</td>
                  <td className="p-4 text-center text-sm text-gray-600">
                    {(comanda.createdAt instanceof Timestamp)
                      ? comanda.createdAt.toDate().toLocaleDateString('ro-RO')
                      : "N/A"}
                  </td>
                  <td className="p-4 text-center font-bold text-gray-800">
                    {comanda.amount?.toFixed(2) ?? '0.00'} RON
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        comanda.status === 'completed' ? 'bg-green-100 text-green-700' :
                        comanda.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                    }`}>
                        {comanda.status === 'completed' ? 'Finalizată' : comanda.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  Nu ai plasat nicio comandă încă.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}