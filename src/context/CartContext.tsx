import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type LinieCos = {
  cartId: number; // ID intern în coș (unic)
  id: number;     // ID-ul produsului
  titlu: string;
  pret: number;
};

type Produs = {
  id: number;
  titlu: string;
  pret: number;
};

type CartContextType = {
  cart: LinieCos[];
  adaugaInCos: (produs: Produs) => void;
  stergeDinCos: (cartId: number) => void;
  golesteCos: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<LinieCos[]>([]);

  // La încărcare, citește din localStorage
  useEffect(() => {
    const stored = localStorage.getItem("cos");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setCart(parsed);
      } catch (error) {
        console.error("Eroare la parsarea coșului:", error);
      }
    }
  }, []);

  // La orice modificare, salvează în localStorage
  useEffect(() => {
    localStorage.setItem("cos", JSON.stringify(cart));
  }, [cart]);

  const adaugaInCos = (produs: Produs) => {
    setCart((prev) => [
      ...prev,
      { ...produs,
        pret: Number(produs.pret), 
        cartId: Date.now() + Math.random() 
      },
    ]);
  };

  const stergeDinCos = (cartId: number) => {
    setCart((prev) => prev.filter((p) => p.cartId !== cartId));
  };

  const golesteCos = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
  value={{ cart, adaugaInCos, stergeDinCos, golesteCos }} // ✅ INCLUS aici
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

