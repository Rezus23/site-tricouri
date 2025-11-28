import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

type LinieCos = {
  cartId: number;
  id: number;
  titlu: string;
  pret: number;
  imagine?: string; // Am adăugat imagine pentru pop-up
  marime?: string;  // Am adăugat mărime pentru pop-up
};

type Produs = {
  id: number;
  titlu: string;
  pret: number;
  imagine?: string;
  marimi?: string[];
  // Proprietăți opționale pentru adăugare directă
  marimeSelectata?: string;
};

type CartContextType = {
  cart: LinieCos[];
  lastAddedItem: LinieCos | null; // 👈 NOU: Ultimul produs pentru Pop-up
  isPopupOpen: boolean;           // 👈 NOU: Starea Pop-up-ului
  closePopup: () => void;         // 👈 NOU: Funcție de închidere
  adaugaInCos: (produs: Produs) => void;
  stergeDinCos: (cartId: number) => void;
  golesteCos: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<LinieCos[]>([]);
  const [lastAddedItem, setLastAddedItem] = useState<LinieCos | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("cos");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setCart(parsed);
      } catch (error) { console.error(error); }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("cos", JSON.stringify(cart));
  }, [cart]);

  // Funcții stabilizate cu useCallback
  const adaugaInCos = useCallback((produs: Produs) => {
    const newItem: LinieCos = {
      id: produs.id,
      titlu: produs.titlu,
      pret: Number(produs.pret),
      imagine: produs.imagine,
      marime: produs.marimeSelectata, // Salvăm mărimea dacă există
      cartId: Date.now() + Math.random(),
    };

    setCart((prev) => [...prev, newItem]);
    
    // 🔔 DECLANȘĂM POP-UP-UL
    setLastAddedItem(newItem);
    setIsPopupOpen(true);
    
    // Auto-închidere după 5 secunde (opțional)
    // setTimeout(() => setIsPopupOpen(false), 5000); 
  }, []);

  const stergeDinCos = useCallback((cartId: number) => {
    setCart((prev) => prev.filter((p) => p.cartId !== cartId));
  }, []);

  const golesteCos = useCallback(() => {
    setCart([]);
  }, []);

  const closePopup = useCallback(() => {
    setIsPopupOpen(false);
  }, []);

  return (
    <CartContext.Provider
      value={{ cart, adaugaInCos, stergeDinCos, golesteCos, lastAddedItem, isPopupOpen, closePopup }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart trebuie folosit în CartProvider");
  return context;
}