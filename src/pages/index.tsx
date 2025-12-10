import Link from "next/link";
import Head from "next/head";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";
import BlurredBackground from "@/components/BlurredBackground"; // Asigură-te că e importat

export default function Home() {
  return (
    <>
      <Head>
        <title>Passion4Jerseys - Tricouri Fotbal Premium</title>
        <meta name="description" content="Cele mai noi echipamente de fotbal." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Container Principal */}
      <div className="min-h-screen relative flex flex-col pt-20 w-full overflow-x-hidden">
        
        {/* --- FUNDALUL BLURAT NEGRU --- */}
        {/* Folosim componenta existentă, dar punem un overlay negru puternic peste ea */}
        <div className="fixed inset-0 z-[-1]">
            <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/images/hero-banner.jpg')" }}
            ></div>
            {/* Acest div face magia: Blur + Negru transparent */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md"></div>
        </div>


        {/* --- CONȚINUTUL PAGINII --- */}
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
          
      {/* --- 👇 BARA PROMOȚIONALĂ ANIMATĂ --- */}
      <div className="bg-yellow-400 text-black py-2 overflow-hidden relative z-50 shadow-sm border-b border-yellow-500">
        <div className="whitespace-nowrap animate-marquee font-bold text-sm tracking-wide uppercase">
          🔥 Folosește codul promoțional <span className="bg-black text-white px-2 py-0.5 rounded mx-1">PASSION15</span> în perioada 15.12 - 31.12 pentru <span className="underline decoration-black">15% REDUCERE</span> la orice comandă! ⚽
        </div>
      </div>
      {/* --- 👆 END BARĂ --- */}
  
  {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 text-center">
    
    <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-blue-400 text-sm font-bold tracking-widest mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      NEW SEASON 25/26
    </span>

    <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-tight tracking-tighter drop-shadow-2xl animate-in zoom-in duration-700">
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

        {/* Footer */}
        <footer className="bg-[#0a0a0a] py-12 text-center text-gray-500 text-sm border-t border-gray-900 mt-auto w-full">
          
          {/* --- SOCIAL MEDIA --- */}
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
              className="bg-white/10 p-3 rounded-full text-white hover:bg-black hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.5)] hover:scale-110 transition transform duration-300"
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
        
        
          
          <p className="mb-6 text-gray-400">© 2025 Passion4Jerseys. Toate drepturile rezervate.</p>
          
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <Link href="/termeni" className="hover:text-lime-400 transition">Termeni și Condiții</Link>
            <Link href="/confidentialitate" className="hover:text-lime-400 transition">Politica de Confidențialitate</Link>
            <Link href="/retur" className="hover:text-lime-400 transition">Politica de Retur</Link>
            <Link href="/contact" className="hover:text-lime-400 transition">Contact</Link>
          </div>

          {/* --- INTEGRARE NETOPIA IFRAME --- */}
          <div className="flex justify-center mb-8">
            <iframe 
                src="https://mny.ro/npId.html?color=%23050505&version=orizontal&secret=157332" 
                title="NETOPIA Payments"
                // Am convertit stilul HTML în obiect React și am mărit lățimea la 480px ca să încapă sigla orizontală
                style={{ border: 'none', width: '480px', height: '60px', overflow: 'hidden' }} 
            />
          </div>

          {/* Logo-uri ANPC */}
          <div className="flex justify-center gap-4 opacity-80 hover:opacity-100 transition-opacity">
            <a href="https://anpc.ro/ce-este-sal/" target="_blank" rel="noreferrer">
                <img src="/images/sal.png" alt="ANPC SAL" className="h-8 md:h-10 w-auto" />
            </a>
            <a href="https://europa.eu/youreurope/business/dealing-with-customers/solving-disputes/alternative-dispute-resolution/index_ro.html" target="_blank" rel="noreferrer">
                <img src="/images/sol.png" alt="ANPC SOL" className="h-8 md:h-10 w-auto" />
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