import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useCart } from "@/context/CartContext";
import { db } from "@/lib/firebase";
import { collection, query, getDocs } from "firebase/firestore";
import { FiHome, FiShoppingBag, FiUser, FiSearch, FiMenu, FiX, FiGrid } from "react-icons/fi";

type SearchResult = {
  id: string;
  titlu: string;
  imagine: string;
};

export default function Navbar() {
  const { cart } = useCart();
  const router = useRouter();
  
  const isShopPage = router.pathname === "/shop";

  // Stări UI
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  
  // Stări Căutare
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [allProducts, setAllProducts] = useState<SearchResult[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isShopPage) return;
    const fetchProductsForSearch = async () => {
      if (allProducts.length > 0) return;
      const q = query(collection(db, "products"));
      const snap = await getDocs(q);
      const products = snap.docs.map(doc => ({
        id: doc.id,
        titlu: doc.data().titlu,
        imagine: doc.data().imagini?.[0] || doc.data().imagine 
      }));
      setAllProducts(products as SearchResult[]);
    };
    fetchProductsForSearch();
  }, [isShopPage]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }
    const results = allProducts.filter(p => 
      p.titlu.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(results.slice(0, 5)); 
  }, [searchTerm, allProducts]);

  useEffect(() => {
    setSearchTerm("");
    setSearchResults([]);
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  }, [router.asPath]);

  return (
    <>
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-white/10 ${
          isScrolled || isMobileSearchOpen ? "bg-black/95 backdrop-blur-md shadow-lg" : "bg-black/80 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center h-20">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center z-50 relative shrink-0 -ml-3 md:ml-0">
            <img 
              src="/images/logo.jpg" 
              alt="Logo" 
              className="h-12 w-12 md:h-16 md:w-16 object-cover rounded-full hover:scale-105 transition border border-white/20" 
            />
          </Link>

          {/* SEARCH BAR DESKTOP */}
          {isShopPage ? (
            <div className="hidden md:block relative flex-1 max-w-md mx-8 animate-in fade-in zoom-in duration-300">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Caută..."
                  className="w-full bg-gray-900/80 text-white border border-gray-700 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-lime-400 focus:bg-black transition-all placeholder-gray-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {searchTerm && searchResults.length > 0 && (
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
          ) : (
            <div className="hidden md:block flex-1"></div>
          )}

          {/* --- MENIU DREAPTA (DESKTOP) --- */}
          {/* Ordinea: Home -> Magazin -> Coș -> Cont */}
          <div className="hidden md:flex items-center gap-8 text-white">
            
            {/* 1. Home */}
            <NavLink href="/" icon={<FiHome />} text="Home" />
            
            {/* 2. Magazin */}
            <NavLink href="/shop" icon={<FiGrid />} text="Magazin" />
            
            {/* 3. Coș (Mutat aici) */}
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

            {/* 4. Cont (Mutat la final) */}
            <Link href="/contul_meu" className="hover:text-lime-400 transition flex flex-col items-center gap-1 group">
              <FiUser className="text-xl group-hover:scale-110 transition" />
              <span className="text-[10px] uppercase font-bold tracking-widest">Cont</span>
            </Link>

          </div>

          {/* --- ICONIȚE MOBIL --- */}
          <div className="flex md:hidden items-center gap-6 text-white">
            {isShopPage && (
                <button 
                    onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                    className={`text-2xl transition ${isMobileSearchOpen ? 'text-lime-400' : 'text-white'}`}
                >
                    {isMobileSearchOpen ? <FiX /> : <FiSearch />}
                </button>
            )}

            <Link href="/cart" className="relative">
                <FiShoppingBag className="text-2xl" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-lime-400 text-black text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
            </Link>

            <button 
                className="text-3xl z-50 flex items-center" 
                onClick={() => {
                    setIsMobileMenuOpen(!isMobileMenuOpen);
                    setIsMobileSearchOpen(false);
                }}
            >
                {isMobileMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {/* SEARCH BAR MOBIL */}
        {isShopPage && isMobileSearchOpen && (
            <div className="md:hidden px-6 pb-4 bg-black/95 backdrop-blur-md border-b border-gray-800 animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="relative">
                    <input
                        autoFocus
                        type="text"
                        placeholder="Caută..."
                        className="w-full bg-gray-800 text-white p-3 pl-10 rounded-lg text-base focus:outline-none focus:ring-1 focus:ring-lime-400 placeholder-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                </div>

                {searchTerm && searchResults.length > 0 && (
                  <div className="mt-2 bg-white rounded-lg overflow-hidden shadow-xl max-h-60 overflow-y-auto">
                    {searchResults.map(prod => (
                      <Link key={prod.id} href={`/magazin/${prod.id}`}>
                        <div className="p-3 text-black border-b last:border-b-0 font-bold flex items-center gap-3 active:bg-gray-100">
                           <img src={prod.imagine} className="h-10 w-10 object-contain rounded" />
                           <span className="text-sm">{prod.titlu}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
            </div>
        )}

        {/* --- MENIU LATERAL MOBIL --- */}
        {/* Ordine actualizată și aici */}
        <div className={`fixed inset-0 bg-black/95 z-40 transition-transform duration-300 flex flex-col justify-center px-8 ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
            <div className="flex flex-col gap-8 text-2xl font-bold text-white text-center">
                <MobileLink href="/" text="Acasă" onClick={() => setIsMobileMenuOpen(false)} />
                <MobileLink href="/shop" text="Magazin" onClick={() => setIsMobileMenuOpen(false)} />
                <MobileLink href="/cart" text={`Coșul Meu (${cart.length})`} onClick={() => setIsMobileMenuOpen(false)} />
                <MobileLink href="/contul_meu" text="Contul Meu" onClick={() => setIsMobileMenuOpen(false)} />
            </div>
        </div>
      </nav>
      
      <div className="h-20 md:h-24"></div>
    </>
  );
}

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
        <Link href={href} onClick={onClick} className="hover:text-lime-400 transition border-b border-gray-800 pb-4 w-full">
            {text}
        </Link>
    );
}