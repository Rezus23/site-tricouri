import Link from "next/link";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Passion4Jerseys - Tricouri Fotbal Premium</title>
        <meta name="description" content="Cele mai noi echipamente de fotbal." />
      </Head>

      {/* 👇 AICI: pt-20 (spațiu sus) și bg-black (fundal negru) */}
      <div className="min-h-screen bg-black text-white font-sans flex flex-col pt-20">
        
        {/* HERO SECTION */}
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
              <span className="text-white">Descoperă noua </span>
              <span className="text-lime-400 block md:inline">colecție</span>
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

        {/* Restul conținutului (Footer etc.) rămâne la fel */}
        <footer className="bg-[#0a0a0a] py-12 text-center text-gray-500 text-sm border-t border-gray-900">
            {/* ... cod footer ... */}
        </footer>
      </div>
    </>
  );
}