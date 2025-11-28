import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useCart } from "@/context/CartContext";
import { db } from "@/lib/firebase";
import { collection, query, getDocs } from "firebase/firestore";
import { FiHome, FiShoppingBag, FiUser, FiSearch, FiMenu, FiX, FiGrid } from "react-icons/fi";

// Tip pentru rezultatele căutării
type SearchResult = {
  id: string;
  titlu: string;
  imagine: string;
};

export default function Navbar() {
  const { cart } = useCart();
  const router = useRouter();
  
  // Stări pentru UI
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Stări pentru Căutare
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [allProducts, setAllProducts] = useState<SearchResult[]>([]); // Cache local pentru viteză

  // 1. Efect la Scroll (pentru fundal blurat)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. Încărcăm produsele o singură dată (pentru căutare rapidă)
  useEffect(() => {
    const fetchProductsForSearch = async () => {
      const q = query(collection(db, "products"));
      const snap = await getDocs(q);
      const products = snap.docs.map(doc => ({
        id: doc.id,
        titlu: doc.data().titlu,
        imagine: doc.data().imagini?.[0] || doc.data().imagine // Fallback imagine
      }));
      setAllProducts(products as SearchResult[]);
    };
    fetchProductsForSearch();
  }, []);

  // 3. Logica de Căutare Live
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }
    const results = allProducts.filter(p => 
      p.titlu.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(results.slice(0, 5)); // Arătăm max 5 rezultate
  }, [searchTerm, allProducts]);

  // Resetare căutare la schimbarea paginii
  useEffect(() => {
    setSearchTerm("");
    setSearchResults([]);
    setIsMobileMenuOpen(false);
  }, [router.asPath]);

  return (
    <>
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? "bg-black/80 backdrop-blur-md shadow-lg py-3" : "bg-black py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center gap-4">
          
          {/* --- LOGO --- */}
          <Link href="/" className="text-2xl font-black italic tracking-tighter flex flex-col items-center leading-none text-white z-50">
            <span>SPORTS<span className="text-lime-400">X</span></span>
          </Link>

          {/* --- SEARCH BAR (Desktop) --- */}
          <div className="hidden md:block relative flex-1 max-w-md mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Caută tricoul favorit..."
                className="w-full bg-gray-900 text-white border border-gray-700 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-lime-400 transition-colors placeholder-gray-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Rezultate Căutare Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
                {searchResults.map(prod => (
                  <Link key={prod.id} href={`/magazin/${prod.id}`}>
                    <div className="flex items-center gap-3 p-3 hover:bg-gray-100 transition cursor-pointer border-b last:border-b-0">
                      <img src={prod.imagine} alt={prod.titlu} className="h-10 w-10 object-contain rounded" />
                      <span className="text-sm font-bold text-gray-800">{prod.titlu}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* --- MENIU DREAPTA (Desktop) --- */}
          <div className="hidden md:flex items-center gap-6 text-white">
            <NavLink href="/" icon={<FiHome />} text="Home" />
            <NavLink href="/shop" icon={<FiGrid />} text="Magazin" />
            
            <Link href="/contul_meu" className="hover:text-lime-400 transition flex flex-col items-center gap-1 group">
              <FiUser className="text-xl group-hover:scale-110 transition" />
              <span className="text-[10px] uppercase font-bold tracking-widest">Cont</span>
            </Link>

            <Link href="/cart" className="relative hover:text-lime-400 transition flex flex-col items-center gap-1 group">
              <div className="relative">
                <FiShoppingBag className="text-xl group-hover:scale-110 transition" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-lime-400 text-black text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
                    {cart.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest">Coș</span>
            </Link>
          </div>

          {/* --- BUTON MENIU MOBIL --- */}
          <button 
            className="md:hidden text-white text-2xl z-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* --- MENIU MOBIL (Overlay) --- */}
        <div className={`fixed inset-0 bg-black/95 backdrop-blur-xl z-40 transition-transform duration-300 flex flex-col justify-center px-8 ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
            
            {/* Search Mobil */}
            <div className="mb-8 relative">
                <input
                    type="text"
                    placeholder="Caută..."
                    className="w-full bg-gray-800 text-white p-4 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-lime-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {/* Rezultate Mobil */}
                {searchResults.length > 0 && (
                  <div className="mt-2 bg-white rounded-lg overflow-hidden">
                    {searchResults.map(prod => (
                      <Link key={prod.id} href={`/magazin/${prod.id}`}>
                        <div className="p-3 text-black border-b font-bold flex items-center gap-2">
                           <img src={prod.imagine} className="h-8 w-8 object-contain" />
                           {prod.titlu}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
            </div>

            <div className="flex flex-col gap-6 text-2xl font-bold text-white">
                <MobileLink href="/" text="Acasă" onClick={() => setIsMobileMenuOpen(false)} />
                <MobileLink href="/shop" text="Magazin" onClick={() => setIsMobileMenuOpen(false)} />
                <MobileLink href="/contul_meu" text="Contul Meu" onClick={() => setIsMobileMenuOpen(false)} />
                <MobileLink href="/cart" text={`Coș (${cart.length})`} onClick={() => setIsMobileMenuOpen(false)} />
            </div>
        </div>
      </nav>
      
      {/* Spacer pentru a nu intra conținutul sub navbar */}
      <div className="h-24 md:h-28"></div>
    </>
  );
}

// Componente ajutătoare mici pentru curățenie
function NavLink({ href, icon, text }: { href: string; icon: any; text: string }) {
  return (
    <Link href={href} className="hover:text-lime-400 transition flex flex-col items-center gap-1 group">
      <span className="text-xl group-hover:scale-110 transition">{icon}</span>
      <span className="text-[10px] uppercase font-bold tracking-widest">{text}</span>
    </Link>
  );
}

function MobileLink({ href, text, onClick }: { href: string; text: string; onClick: () => void }) {
    return (
        <Link href={href} onClick={onClick} className="hover:text-lime-400 transition border-b border-gray-800 pb-2">
            {text}
        </Link>
    );
}