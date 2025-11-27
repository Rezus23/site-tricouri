import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

// Definește structura datelor (FIX: Am redenumit total -> amount)
type Comanda = {
  id: string;
  createdAt: Timestamp; 
  amount: number; // 👈 FIX AICI: Folosim 'amount' pentru Total
  status: string;
};

export default function ContulMeu() {
  const { user } = useAuth();
  const router = useRouter();
  const [comenzi, setComenzi] = useState<Comanda[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      setLoading(false);
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
          <div className="p-8 text-center text-gray-500 min-h-screen dark:text-gray-400 dark:bg-black">
              Se încarcă istoricul comenzilor...
          </div>
      );
  }

  if (!user) return null; 

  return (
    <div className="p-4 max-w-4xl mx-auto min-h-screen dark:bg-black dark:text-white">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-center sm:text-left">Contul Meu</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mt-4 sm:mt-0"
        >
          Ieși din cont
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-3">Istoric comenzi</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-700 dark:border-gray-600">
          <thead className="bg-gray-200 dark:bg-gray-800">
            <tr>
              <th className="p-3 border dark:border-gray-700 text-left">ID Comandă</th>
              <th className="p-3 border dark:border-gray-700">Data</th>
              <th className="p-3 border dark:border-gray-700">Total</th>
              <th className="p-3 border dark:border-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {comenzi.length > 0 ? (
              comenzi.map((comanda) => (
                <tr key={comanda.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                  <td className="p-3 border text-sm break-all">{comanda.id}</td>
                  <td className="p-3 border text-center">
                    {(comanda.createdAt instanceof Timestamp)
                      ? comanda.createdAt.toDate().toLocaleDateString('ro-RO')
                      : "N/A"}
                  </td>
                  <td className="p-3 border text-center font-bold">
                    {/* 👈 FIX AICI: Afișăm comanda.amount */}
                    {comanda.amount?.toFixed(2) ?? '0.00'} RON
                  </td>
                  <td className="p-3 border text-center font-medium">
                    {comanda.status}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  Nicio comandă plasată încă.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}