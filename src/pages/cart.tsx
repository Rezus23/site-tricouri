import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";


export default function Cart() {
  const { cart, stergeDinCos, golesteCos } = useCart();
  const { user } = useAuth();

  const total = cart.reduce((acc, p) => acc + Number(p.pret), 0);

  const handleStripeRedirect = async () => {
 

  const email = user?.email || prompt("Introdu adresa ta de email:");

  if (!email) {
    alert("Trebuie să introduci o adresă de email.");
    return;
  }

  const res = await fetch("/api/checkout_sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ produse: cart, email }),
  });

  const data = await res.json();
  if (data.url) window.location.href = data.url;
  else alert("A apărut o eroare. Încearcă din nou.");
 };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
        Coșul tău
      </h1>

      {cart.length === 0 ? (
        <p className="text-center text-gray-600">Coșul este gol.</p>
      ) : (
        <div className="space-y-4">
          {cart.map((produs) => (
            <div
              key={produs.cartId}
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-2"
            >
              <div className="text-center sm:text-left">
                <p className="font-medium">{produs.titlu}</p>
                <p className="text-sm text-gray-500">{produs.pret} RON</p>
              </div>
              <button
                onClick={() => stergeDinCos(produs.cartId)}
                className="mt-2 sm:mt-0 text-red-500 hover:text-red-700 transition"
              >
                🗑️
              </button>
            </div>
          ))}

          <div className="flex justify-between font-bold text-lg pt-4 border-t">
            <span>Total</span>
            <span>{total.toFixed(2)} RON</span>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <button
              onClick={golesteCos}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Golește coșul
            </button>

            <button
            onClick={handleStripeRedirect}
             className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition text-center"
            >
              Catre Plata
            </button>
          </div>
        </div>
      )}
    </div>
  );
}