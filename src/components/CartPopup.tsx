import { useCart } from "@/context/CartContext";
import { useRouter } from "next/router";
import { FiCheck, FiX } from "react-icons/fi";
import Link from "next/link";

export default function CartPopup() {
  const { isPopupOpen, closePopup, lastAddedItem, cart } = useCart();
  const router = useRouter();

  if (!isPopupOpen || !lastAddedItem) return null;

  return (
    <div className="fixed top-24 right-4 md:right-10 z-[60] animate-in fade-in slide-in-from-right-10 duration-300">
      <div className="bg-[#1a1a1a] text-white border border-gray-700 w-80 md:w-96 shadow-2xl rounded-sm p-5 relative">
        
        {/* Header: Mesaj Succes */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 text-lime-400">
            <FiCheck className="text-xl" />
            <span className="font-semibold text-sm">Produs adăugat în coș</span>
          </div>
          <button onClick={closePopup} className="text-gray-400 hover:text-white transition">
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Produs Info */}
        <div className="flex gap-4 mb-6">
          <div className="w-20 h-20 bg-white rounded-sm overflow-hidden flex-shrink-0">
            <img 
              src={lastAddedItem.imagine || "/images/logo.jpg"} 
              alt={lastAddedItem.titlu} 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h4 className="font-bold text-sm leading-tight mb-1 line-clamp-2">{lastAddedItem.titlu}</h4>
            {lastAddedItem.marime && (
                <p className="text-xs text-gray-400">Mărime: <span className="text-white">{lastAddedItem.marime}</span></p>
            )}
            <p className="text-xs text-gray-400 mt-1">Preț: <span className="text-lime-400">{lastAddedItem.pret} RON</span></p>
          </div>
        </div>

        {/* Butoane Acțiune */}
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => { closePopup(); router.push('/cart'); }}
            className="w-full py-2 border border-white text-white text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-black transition"
          >
            Vezi Coșul ({cart.length})
          </button>
          
          <button 
            onClick={() => { closePopup(); router.push('/checkout/adresa'); }}
            className="w-full py-2 bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-gray-200 transition"
          >
            Finalizează Comanda
          </button>
          
          <button 
            onClick={closePopup}
            className="text-center text-xs text-gray-400 underline hover:text-white mt-1"
          >
            Continuă cumpărăturile
          </button>
        </div>

      </div>
    </div>
  );
}