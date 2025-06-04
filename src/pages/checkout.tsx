import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { db } from "@/lib/firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { useRouter } from "next/router";
import { loadStripe } from "@stripe/stripe-js";

export default function Checkout() {
  const router = useRouter();
  const { cart, golesteCos } = useCart();
  const [formData, setFormData] = useState({
    nume: "",
    email: "",
    adresa: "",
  });
  const [mesaj, setMesaj] = useState("");
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    if (typeof window !== "undefined" && cart.length === 0 && !mesaj) {
      router.push("/shop");
    }
  }, [cart, mesaj, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const { nume, email, adresa } = formData;

  if (!nume || !email || !adresa) {
    setMesaj("❗ Completează toate câmpurile.");
    return;
  }

  try {
    setLoading(true);

    // ✅ 1. Salvăm comanda în Firestore
    await addDoc(collection(db, "comenzi"), {
      ...formData,
      produse: cart,
      total: cart.reduce((acc: number, p) => acc + Number(p.pret), 0),
      data: Timestamp.now(),
    });

    // ✅ 2. Trimitem email
    const emailRes = await fetch("/api/sendEmail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        produse: cart,
        total: cart.reduce((acc: number, p) => acc + Number(p.pret), 0),
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error("❌ Email error:", errText);
      throw new Error("Eroare la trimiterea emailului");
    }

    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);
    if (!stripe) throw new Error('Stripe nu a fost inițializat');

    const checkoutRes = await fetch('/api/checkout_sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ produse: cart, email }),
    });

    if (!checkoutRes.ok) {
    const errText = await checkoutRes.text();
    console.error('❌ Stripe error:', errText);
    throw new Error('Eroare la sesiunea de plată Stripe');
    }

    const { url } = await checkoutRes.json();
    if (url) {
      window.location.href = url;
    } else {
      throw new Error('Stripe nu a returnat URL');
    }

  } catch (err) {
    console.error("❌ Eroare totală:", err);
    setMesaj("❌ A apărut o eroare. Încearcă din nou.");
  } finally {
    setLoading(false);
  }
 };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
        Finalizare comandă
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="nume"
          placeholder="Nume complet"
          value={formData.nume}
          onChange={handleChange}
          className="w-full border border-gray-300 px-4 py-2 rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Adresă de email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border border-gray-300 px-4 py-2 rounded"
        />
        <textarea
          name="adresa"
          placeholder="Adresă de livrare"
          rows={4}
          value={formData.adresa}
          onChange={handleChange}
          className="w-full border border-gray-300 px-4 py-2 rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition w-full"
        >
          {loading ? "Se trimite..." : "Trimite comanda"}
        </button>
      </form>

      {mesaj && (
        <p className="text-center text-sm text-blue-600 mt-4">{mesaj}</p>
      )}
    </div>
  );
}