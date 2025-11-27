import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Timestamp } from "firebase/firestore";


const { user } = useAuth(); 
const userId = user?.uid;
type Comanda = {
  id: string;
  data: Timestamp;
  total: number;
  email: string;
  // alte câmpuri...
};

export default function ContulMeu() {
  const { user } = useAuth();
  const router = useRouter();
  const [comenzi, setComenzi] = useState<Comanda[]>([]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      const fetchComenzi = async () => {
        const q = query(
          collection(db, "comenzi"),
          where("email", "==", user.email),
          orderBy("data", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Comanda, "id">) 
        }));
        setComenzi(data);
      };

      fetchComenzi();
    }
  }, [user, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (!user) return null;

  return (
    <div className="p-4 max-w-4xl mx-auto">
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
        <table className="min-w-full table-auto border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Data</th>
              <th className="p-2 border">Total</th>
            </tr>
          </thead>
          <tbody>
            {comenzi.length > 0 ? (
              comenzi.map((comanda) => (
                <tr key={comanda.id}>
                  <td className="p-2 border text-sm break-all">{comanda.id}</td>
                  <td className="p-2 border">
                    {(comanda.data instanceof Timestamp)
                      ? comanda.data.toDate().toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-2 border">{comanda.total} RON</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-500">
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