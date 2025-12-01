import Link from "next/link";
import Head from "next/head";
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
              <span className="text-white">Descoperă noua </span>
              <span className="text-lime-400 block md:inline">colecție</span>
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

        {/* Footer */}
        <footer className="bg-black/40 backdrop-blur-sm py-12 text-center text-gray-500 text-sm border-t border-white/10 mt-auto">
           {/* ... conținut footer ... */}
           <p className="mb-6">© 2025 Passion4Jerseys. Toate drepturile rezervate.</p>
           {/* ... link-uri ... */}
        </footer>
      </div>
    </>
  );
}