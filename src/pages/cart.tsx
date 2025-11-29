import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { FiTrash2, FiShoppingBag, FiArrowRight } from "react-icons/fi"; // Importăm iconițe profi
import Link from "next/link";

export default function Cart() {
  const { cart, stergeDinCos, golesteCos } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const total = cart.reduce((acc, p) => acc + Number(p.pret), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Titlu Pagină */}
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
          <FiShoppingBag className="text-blue-600" />
          Coșul tău
        </h1>

        {cart.length === 0 ? (
          // STARE: COȘ GOL
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <div className="bg-gray-100 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiShoppingBag className="text-4xl text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Coșul este gol</h2>
            <p className="text-gray-500 mb-8">Nu ai adăugat încă niciun produs.</p>
            <Link 
                href="/shop" 
                className="inline-block bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition shadow-lg"
            >
                Vezi Produsele
            </Link>
          </div>
        ) : (
          // STARE: COȘ CU PRODUSE
          <div className="space-y-6">
            
            {/* Lista Produse */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
              {cart.map((produs) => (
                <div
                  key={produs.cartId}
                  className="flex flex-col sm:flex-row items-center gap-6 p-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition"
                >
                  {/* 1. IMAGINEA PRODUSULUI (Mică) */}
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white">
                    <img 
                        src={produs.imagine || "/images/logo.jpg"} 
                        alt={produs.titlu} 
                        className="h-full w-full object-contain"
                    />
                  </div>

                  {/* Detalii Text */}
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-bold text-gray-900">{produs.titlu}</h3>
                    
                    {/* Afișăm Mărimea dacă există */}
                    {produs.marime && (
                        <p className="text-sm text-gray-500 mt-1">
                            Mărime: <span className="font-semibold text-gray-700">{produs.marime}</span>
                        </p>
                    )}
                    
                    <p className="text-blue-600 font-bold mt-2 sm:hidden">{produs.pret} RON</p>
                  </div>

                  {/* Preț (Desktop) */}
                  <div className="hidden sm:block text-right">
                    <p className="text-lg font-bold text-gray-900">{produs.pret} RON</p>
                  </div>

                  {/* 2. BUTON ȘTERGERE (Iconiță Profi) */}
                  <button
                    onClick={() => stergeDinCos(produs.cartId)}
                    className="p-3 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition duration-200 group"
                    title="Elimină din coș"
                  >
                    <FiTrash2 className="text-xl group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              ))}
            </div>

            {/* Sumar Comandă */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100">
                <span className="text-gray-600 text-lg">Total de plată</span>
                <span className="text-3xl font-extrabold text-blue-600">{total.toFixed(2)} RON</span>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                
                {/* Buton Golește */}
                <button
                  onClick={golesteCos}
                  className="text-red-500 hover:text-red-700 text-sm font-semibold underline decoration-transparent hover:decoration-red-700 transition"
                >
                  Golește tot coșul
                </button>

                {/* Buton Continuă */}
                <button
                  onClick={() => router.push('/checkout/adresa')}
                  disabled={cart.length === 0}
                  className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 disabled:bg-gray-400"
                >
                  Continuă la Livrare
                  <FiArrowRight className="text-xl" />
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}