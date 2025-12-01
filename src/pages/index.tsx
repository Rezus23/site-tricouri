import Link from "next/link";
import Head from "next/head";
import { useEffect, useRef } from "react"; 

export default function Home() {
  // Referință către containerul unde vom injecta scriptul Netopia
  const netopiaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Rulăm codul doar dacă containerul există și este gol (ca să nu punem scriptul de două ori)
    if (netopiaRef.current && netopiaRef.current.children.length === 0) {
      const script = document.createElement("script");
      
      // Setările din scriptul trimis de tine:
      script.src = "https://mny.ro/npId.js?p=157332";
      script.type = "text/javascript";
      script.setAttribute("data-version", "orizontal"); // Aici ai cerut varianta orizontală
      script.setAttribute("data-contrast-color", "#1a1919");
      script.async = true; // Important pentru performanță

      // Adăugăm scriptul în interiorul div-ului din footer
      netopiaRef.current.appendChild(script);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Passion4Jerseys - Tricouri Fotbal Premium</title>
        <meta name="description" content="Cumpără tricouri de fotbal autentice, retro și noi. Livrare rapidă în România." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-black text-white font-sans flex flex-col pt-20">
        
        {/* --- HERO SECTION --- */}
        <div className="relative h-[85vh] w-full overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: "url('/images/hero-banner.jpg')", 
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30"></div>
          </div>

          <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
            <h2 className="text-5xl md:text-7xl font-extrabold uppercase mb-6 tracking-tight drop-shadow-2xl animate-in fade-in zoom-in duration-700">
              <span className="text-white">Descoperă-ţi </span>
              <span className="text-lime-400 block md:inline">pasiunea</span>
            </h2>
            
            <p className="text-gray-200 text-xl mb-12 max-w-2xl mx-auto font-medium drop-shadow-md animate-in slide-in-from-bottom-4 duration-1000 delay-200">
              Cele mai noi echipamente ale echipelor tale favorite sunt acum disponibile în stoc limitat.
            </p>

            <Link 
              href="/shop"
              className="group relative px-12 py-4 border-2 border-lime-400 text-white uppercase tracking-[4px] text-sm font-bold overflow-hidden transition-all hover:text-black animate-in fade-in duration-1000 delay-500"
            >
              <span className="absolute inset-0 w-0 bg-lime-400 transition-all duration-[300ms] ease-out group-hover:w-full"></span>
              <span className="relative z-10">Cumpără Acum</span>
            </Link>
          </div>
        </div>

        {/* --- FOOTER --- */}
        <footer className="bg-[#0a0a0a] py-12 text-center text-gray-500 text-sm border-t border-gray-900 mt-auto">
          
          <p className="mb-6 text-gray-400">© 2025 Passion4Jerseys. Toate drepturile rezervate.</p>
          
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <Link href="/termeni" className="hover:text-lime-400 transition">Termeni și Condiții</Link>
            <Link href="/confidentialitate" className="hover:text-lime-400 transition">Politica de Confidențialitate</Link>
            <Link href="/retur" className="hover:text-lime-400 transition">Politica de Retur</Link>
            <Link href="/contact" className="hover:text-lime-400 transition">Contact</Link>
          </div>

          {/* --- INTEGRARE NETOPIA SCRIPT --- */}
          {/* Aici scriptul se va injecta singur */}
          <div className="flex justify-center mb-8">
            {/* Folosim un stil minim pentru a asigura că containerul are loc să afișeze ceva */}
            <div ref={netopiaRef} className="min-h-[40px] flex items-center justify-center"></div> 
          </div>

          {/* Logo-uri ANPC */}
          <div className="flex justify-center gap-4 opacity-80 hover:opacity-100 transition-opacity">
            <a href="https://anpc.ro/ce-este-sal/" target="_blank" rel="noreferrer">
                <img src="images/sal.png" alt="ANPC SAL" className="h-8 md:h-10 w-auto" />
            </a>
            <a href="https://europa.eu/youreurope/business/dealing-with-customers/solving-disputes/alternative-dispute-resolution/index_ro.html" target="_blank" rel="noreferrer">
                <img src="images/sol.png" alt="ANPC SOL" className="h-8 md:h-10 w-auto" />
            </a>
          </div>

          <div className="mt-6 text-xs text-gray-600">
            <p>Imaginile produselor sunt cu titlu de prezentare.</p>
          </div>
        </footer>
      </div>
    </>
  );
}