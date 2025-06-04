import { db } from "@/lib/firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { useState } from "react";

export default function TestComanda() {
  const [loading, setLoading] = useState(false);
  const [succes, setSucces] = useState(false);

  const trimiteComanda = async () => {
    setLoading(true);
    try {
      await addDoc(collection(db, "comenzi"), {
        nume: "Ion Popescu",
        email: "ion@example.com",
        produse: [
          { titlu: "Tricou Real Madrid", pret: "199" },
          { titlu: "Tricou FC Barcelona", pret: "209" },
        ],
        total: 408,
        data: Timestamp.now(),
      });
      setSucces(true);
    } catch (err) {
      console.error("Eroare la salvare comanda:", err);
      alert("A apărut o eroare. Incearcă din nou.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Testare Trimitere Comandă</h1>
      <button
        onClick={trimiteComanda}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Se trimite..." : "Trimite comanda"}
      </button>
      {succes && <p className="text-green-600 mt-4">Comanda a fost salvată cu succes!</p>}
    </div>
  );
}