import Link from "next/link";
import Head from "next/head";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";

export default function Home() {
  return (
    <>
      <Head>
        <title>Passion4Jerseys - Tricouri Fotbal Premium</title>
        <meta name="description" content="Cele mai noi echipamente de fotbal." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* ============================================================
          1. BARA PROMOȚIONALĂ INFINITĂ
          🛠️ FIX: Am adăugat 'mt-24' (margin-top) ca să o împingem sub Navbar.
          Ajustează numărul (mt-20, mt-24, mt-28) dacă meniul tău e mai mic/mare.
          ============================================================ */}
      <div className="mt-24 bg-black text-white py-2 overflow-hidden relative border-b border-gray-900 flex z-40">
        
        {/* BLOC 1 */}
        <div className="animate-marquee whitespace-nowrap flex flex-shrink-0 items-center">
          <span className="mx-8 font-bold text-sm tracking-wide uppercase flex items-center gap-2">
            🔥 Folosește codul <span className="bg-white text-black px-2 py-0.5 rounded font-extrabold">PASSION15</span> pentru <span className="underline decoration-white decoration-2">15% REDUCERE</span>!
          </span>
          <span className="mx-4 text-gray-600">|</span>
          <span className="mx-8 font-bold text-sm tracking-wide uppercase">
             🚚 LIVRARE GRATUITĂ LA COMENZI PESTE 300 LEI!
          </span>
          <span className="mx-4 text-gray-600">|</span>
        </div>

        {/* BLOC 2 */}
        <div className="animate-marquee whitespace-nowrap flex flex-shrink-0 items-center">
          <span className="mx-8 font-bold text-sm tracking-wide uppercase flex items-center gap-2">
            🔥 Folosește codul <span className="bg-white text-black px-2 py-0.5 rounded font-extrabold">PASSION15</span> pentru <span className="underline decoration-white decoration-2">15% REDUCERE</span>!
          </span>
          <span className="mx-4 text-gray-600">|</span>
          <span className="mx-8 font-bold text-sm tracking-wide uppercase">
             🚚 LIVRARE GRATUITĂ LA COMENZI PESTE 300 LEI!
          </span>
          <span className="mx-4 text-gray-600">|</span>
        </div>

      </div>

      {/* ============================================================
          2. HERO SECTION
          ============================================================ */}
      <main className="w-full overflow-x-hidden bg-black">
        
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden w-full">
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="container mx-auto px-6 relative z-10 text-center">
            
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-blue-400 text-xs md:text-sm font-bold tracking-widest mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              NEW SEASON 25/26
            </span>

            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-white mb-6 leading-tight tracking-tighter drop-shadow-2xl animate-in zoom-in duration-700">
              WEAR THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-400 animate-gradient bg-300%">
                PASSION.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
              Tricouri de fotbal - Retro, Naționale și cele mai noi kit-uri de joc. 
              Calitate premium pentru suporteri adevărați.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/shop" 
                className="px-10 py-4 bg-white text-black font-bold text-lg rounded-full hover:bg-blue-50 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                Vezi Colecția
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ============================================================
          3. FOOTER
          ============================================================ */}
      <footer className="bg-black py-12 text-center text-gray-500 text-sm border-t border-gray-900 mt-auto w-full relative z-10">
        
        <div className="flex justify-center gap-6 mb-8">
          <a 
            href="https://www.instagram.com/passion4jerseys.ro/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white/10 p-3 rounded-full text-white hover:bg-pink-600 hover:scale-110 transition transform duration-300"
            aria-label="Instagram"
          >
            <FaInstagram className="text-xl" />
          </a>
          
          <a 
            href="https://www.tiktok.com/@passion4jerseys.ro" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white/10 p-3 rounded-full text-white hover:bg-white hover:text-black hover:shadow-[0_0_15px_rgba(255,255,255,0.5)] hover:scale-110 transition transform duration-300"
            aria-label="TikTok"
          >
            <FaTiktok className="text-xl" />
          </a>

          <a 
            href="https://www.facebook.com/profile.php?id=61584609665427" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white/10 p-3 rounded-full text-white hover:bg-blue-600 hover:scale-110 transition transform duration-300"
            aria-label="Facebook"
          >
            <FaFacebookF className="text-xl" />
          </a>
        </div>
        
        <p className="mb-6 text-gray-500">© 2025 Passion4Jerseys. Toate drepturile rezervate.</p>
        
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <Link href="/termeni" className="hover:text-white transition">Termeni și Condiții</Link>
          <Link href="/confidentialitate" className="hover:text-white transition">Politica de Confidențialitate</Link>
          <Link href="/retur" className="hover:text-white transition">Politica de Retur</Link>
          <Link href="/contact" className="hover:text-white transition">Contact</Link>
        </div>

        <div className="flex justify-center mb-8">
          <iframe 
              src="https://mny.ro/npId.html?color=%23000000&version=orizontal&secret=157332" 
              title="NETOPIA Payments"
              style={{ border: 'none', width: '480px', height: '60px', overflow: 'hidden' }} 
          />
        </div>

        <div className="flex justify-center gap-4 opacity-70 hover:opacity-100 transition-opacity">
          <a href="https://anpc.ro/ce-este-sal/" target="_blank" rel="noreferrer">
              <img src="/images/sal.png" alt="ANPC SAL" className="h-8 md:h-10 w-auto" />
          </a>
          <a href="https://europa.eu/youreurope/business/dealing-with-customers/solving-disputes/alternative-dispute-resolution/index_ro.html" target="_blank" rel="noreferrer">
              <img src="/images/sol.png" alt="ANPC SOL" className="h-8 md:h-10 w-auto" />
          </a>
        </div>

        <div className="mt-6 text-xs text-gray-700">
          <p>Imaginile produselor sunt cu titlu de prezentare.</p>
        </div>
      </footer>
    </>
  );
}