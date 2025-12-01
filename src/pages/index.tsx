import Link from "next/link";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Passion4Jerseys - Tricouri Fotbal Premium</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Container Principal - Fără padding lateral */}
      <div className="min-h-screen bg-black text-white font-sans flex flex-col pt-20 w-full">
        
        {/* HERO SECTION - Lățime Completă */}
        <div className="relative h-[85vh] w-full overflow-hidden">
          
          {/* Imaginea de Fundal - Mărită să acopere tot */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat w-full h-full"
            style={{ 
              backgroundImage: "url('/images/hero-banner.jpg')", 
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30"></div>
          </div>

          {/* Conținut Centrat */}
          <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
            <h2 className="text-5xl md:text-7xl font-extrabold uppercase mb-6 tracking-tight drop-shadow-2xl">
              <span className="text-white">Descoperă-ţi</span>
              <span className="text-lime-400 block md:inline">pasiunea</span>
            </h2>
            
            <p className="text-gray-200 text-xl mb-12 max-w-2xl mx-auto font-medium drop-shadow-md">
              Cele mai noi echipamente ale echipelor tale favorite sunt acum disponibile în stoc limitat.
            </p>

            <Link 
              href="/shop"
              className="group relative px-12 py-4 border-2 border-lime-400 text-white uppercase tracking-[4px] text-sm font-bold overflow-hidden transition-all hover:text-black"
            >
              <span className="absolute inset-0 w-0 bg-lime-400 transition-all duration-[300ms] ease-out group-hover:w-full"></span>
              <span className="relative z-10">Cumpără Acum</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-[#0a0a0a] py-12 text-center text-gray-500 text-sm border-t border-gray-900 w-full">
           {/* ... cod footer ... */}
        </footer>
      </div>
    </>
  );
}