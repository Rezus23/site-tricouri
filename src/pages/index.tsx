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
        {/* HERO SECTION - Acum fără imagine proprie, stă pe fundalul global */}
        <div className="relative h-[85vh] w-full flex flex-col justify-center items-center text-center px-4">
            
            <h2 className="text-5xl md:text-7xl font-extrabold uppercase mb-6 tracking-tight drop-shadow-2xl animate-in fade-in zoom-in duration-700">
              <span className="text-white">Descoperă-ţi </span>
              <span className="text-lime-400 block md:inline">pasiunea</span>
            </h2>
            
            <p className="text-gray-200 text-xl mb-12 max-w-2xl mx-auto font-medium drop-shadow-md">
              "Eroi de ieri, idoli de azi. Aceeași emoţie."
            </p>

            <Link 
              href="/shop"
              className="group relative px-12 py-4 border-2 border-lime-400 text-white uppercase tracking-[4px] text-sm font-bold overflow-hidden transition-all hover:text-black"
            >
              <span className="absolute inset-0 w-0 bg-lime-400 transition-all duration-[300ms] ease-out group-hover:w-full"></span>
              <span className="relative z-10">Cumpără Acum</span>
            </Link>

        </div>

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