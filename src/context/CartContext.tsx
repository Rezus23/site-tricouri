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
  id: string; // 👈 AICI AM SCHIMBAT: din number în string
  titlu: string;
  pret: number;
  imagine?: string;
  marime?: string;
};

type Produs = {
  id: string; // 👈 AICI AM SCHIMBAT: din number în string
  titlu: string;
  pret: number;
  imagine?: string;
  marimi?: string[];
  marimeSelectata?: string;
};

type CartContextType = {
  cart: LinieCos[];
  lastAddedItem: LinieCos | null;
  isPopupOpen: boolean;
  closePopup: () => void;
  adaugaInCos: (produs: Produs) => void;
  stergeDinCos: (cartId: number) => void;
  golesteCos: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<LinieCos[]>([]);
  const [lastAddedItem, setLastAddedItem] = useState<LinieCos | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cos");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setCart(parsed);
      } catch (error) { console.error(error); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cos", JSON.stringify(cart));
  }, [cart]);

  const adaugaInCos = useCallback((produs: Produs) => {
    const newItem: LinieCos = {
      id: produs.id, // Acum preia ID-ul real (string)
      titlu: produs.titlu,
      pret: Number(produs.pret),
      imagine: produs.imagine,
      marime: produs.marimeSelectata,
      cartId: Date.now() + Math.random(),
    };

    setCart((prev) => [...prev, newItem]);
    
    setLastAddedItem(newItem);
    setIsPopupOpen(true);
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