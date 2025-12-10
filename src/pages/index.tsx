import Head from "next/head";
import Link from "next/link";
import Navbar from "@/components/Navbar"; // Asigură-te că ai Navbar importat (sau codul lui aici)
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";

export default function Home() {
  return (
    <>
      <Head>
        <title>Passion4Jerseys - Magazin Oficial</title>
      </Head>

      {/* 1. BARA PROMO (Responsive & Fără scroll lateral) */}
      <div className="w-full bg-black text-white py-2 overflow-hidden relative z-50 shadow-sm border-b border-gray-800">
        <div className="whitespace-nowrap animate-marquee font-bold text-xs md:text-sm tracking-wide uppercase px-4">
          🔥 Folosește codul <span className="bg-white text-black px-2 py-0.5 rounded mx-1 font-extrabold">PASSION15</span> pentru <span className="underline decoration-white decoration-2">15% REDUCERE</span>!
        </div>
      </div>

      {/* 2. NAVBAR (Trebuie să fie în componentă, dar aici e structura safe) */}
      {/* <Navbar /> */} 
      {/* Dacă nu ai componenta Navbar, asigură-te că wrapper-ul ei are 'w-full' */}

      <main className="w-full overflow-x-hidden">
        
        {/* --- HERO SECTION RESPONSIVE --- */}
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden w-full">
          
          {/* Background Glow (Limitat să nu iasă din ecran) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-600/30 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />

          {/* Container Conținut (Se adaptează automat) */}
          <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center w-full max-w-7xl">
            
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-blue-400 text-xs md:text-sm font-bold tracking-widest mb-4 md:mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              NEW SEASON 24/25
            </span>

            {/* Titlu care se micșorează pe telefon (text-5xl) și crește pe desktop (text-8xl) */}
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-white mb-6 leading-tight tracking-tighter drop-shadow-2xl animate-in zoom-in duration-700">
              WEAR THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-400 animate-gradient bg-300%">
                PASSION.
              </span>
            </h1>

            <p className="text-base md:text-xl text-gray-400 max-w-xl mx-auto mb-8 md:mb-10 leading-relaxed font-light px-4">
              Tricouri de fotbal autentice. Retro, Naționale și cele mai noi kit-uri.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full px-4">
              <Link 
                href="/shop" 
                className="w-full sm:w-auto px-10 py-4 bg-white text-black font-bold text-lg rounded-full hover:bg-blue-50 transition-all transform hover:scale-105 text-center"
              >
                Vezi Colecția
              </Link>
              <Link 
                href="/contact" 
                className="w-full sm:w-auto px-10 py-4 bg-transparent border border-white/30 text-white font-bold text-lg rounded-full hover:bg-white/10 transition-all backdrop-blur-sm text-center"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Scroll Indicator Centrat */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </section>

      </main>

      {/* --- FOOTER RESPONSIVE --- */}
      <footer className="bg-[#0a0a0a] py-12 border-t border-gray-900 w-full">
          <div className="container mx-auto px-6 flex flex-col items-center">
            
            {/* Social Media */}
            <div className="flex justify-center gap-6 mb-8 flex-wrap">
              <a href="#" className="bg-white/10 p-3 rounded-full text-white hover:bg-pink-600 transition"><FaInstagram /></a>
              <a href="#" className="bg-white/10 p-3 rounded-full text-white hover:bg-black transition"><FaTiktok /></a>
              <a href="#" className="bg-white/10 p-3 rounded-full text-white hover:bg-blue-600 transition"><FaFacebookF /></a>
            </div>

            <p className="mb-6 text-gray-400 text-sm text-center">© 2025 Passion4Jerseys. Toate drepturile rezervate.</p>
            
            {/* Link-uri Legale (Responsive: coloană pe mobil, rând pe desktop) */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-gray-500 text-xs text-center">
                <Link href="/termeni">Termeni și Condiții</Link>
                <Link href="/gdpr">Politica de Confidențialitate</Link>
                <Link href="/retur">Politica de Retur</Link>
                <Link href="/contact">Contact</Link>
            </div>
          </div>
      </footer>
    </>
  );
}