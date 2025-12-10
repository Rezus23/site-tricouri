import Link from "next/link";
import Head from "next/head";
import { FaFacebookF, FaInstagram, FaTiktok, FaStar, FaQuoteRight } from "react-icons/fa";

// 👇 DATELE PENTRU RECENZII (Le poți modifica oricând aici)
const REVIEWS = [
  {
    id: 1,
    nume: "Andrei M.",
    text: "Calitatea tricoului este incredibilă, exact ca varianta de jucător. Materialul respiră foarte bine, iar detaliile sunt impecabile. Recomand cu încredere!",
    rating: 5,
  },
  {
    id: 2,
    nume: "Radu S.",
    text: "Am comandat un tricou retro cu Ronaldo și a ajuns în 2 zile. Arată genial în colecție. Cu siguranță voi mai reveni pentru altele.",
    rating: 5,
  },
  {
    id: 3,
    nume: "Marius D.",
    text: "Cel mai bun raport calitate-preț de pe piață. Mi-a plăcut că am primit update-uri constante despre comandă. Bravo echipei!",
    rating: 5,
  },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>Passion4Jerseys - Tricouri Fotbal Premium</title>
        <meta name="description" content="Cele mai noi echipamente de fotbal." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* 1. BARA PROMOȚIONALĂ */}
      <div className="mt-24 bg-black text-white py-2 overflow-hidden relative border-b border-gray-900 flex z-40">
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
        
        {/* Copie pentru infinit */}
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

      <main className="w-full overflow-x-hidden bg-black">
        
        {/* 2. HERO SECTION */}
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden w-full border-b border-gray-900">
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

        {/* ============================================================
            3. 👇 SECȚIUNE NOUĂ: FEEDBACK CLIENȚI
            ============================================================ */}
        <section className="py-24 bg-[#050505] relative w-full border-b border-gray-900">
            <div className="container mx-auto px-6">
                
                {/* Titlu Secțiune */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">
                        Părerea voastră <span className="text-blue-500">CONTEAZĂ</span>
                    </h2>
                    <p className="text-gray-400 max-w-xl mx-auto">
                        Fii şi tu parte din comunitatea de clienți mulțumiți ce poartă deja echipamentele de pe Passion4Jerseys.
                    </p>
                </div>

                {/* Grid Recenzii */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {REVIEWS.map((review) => (
                        <div key={review.id} className="bg-white/5 border border-white/10 p-8 rounded-2xl relative hover:-translate-y-2 transition-transform duration-300">
                            {/* Iconiță Quote decorativă */}
                            <FaQuoteRight className="absolute top-6 right-6 text-4xl text-white/5" />
                            
                            {/* Stele */}
                            <div className="flex gap-1 text-yellow-400 mb-4">
                                {[...Array(review.rating)].map((_, i) => (
                                    <FaStar key={i} />
                                ))}
                            </div>

                            {/* Text */}
                            <p className="text-gray-300 mb-6 leading-relaxed italic">
                                "{review.text}"
                            </p>

                            {/* Autor */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
                                    {review.nume.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-white text-sm">{review.nume}</p>
                                    <p className="text-xs text-blue-400 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> 
                                        Client Verificat
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
        {/* 👆 END SECȚIUNE FEEDBACK */}

      </main>

      {/* 4. FOOTER */}
      <footer className="bg-black py-12 text-center text-gray-500 text-sm border-t border-gray-900 mt-auto w-full relative z-10">
        
        {/* Social Media */}
        <div className="flex justify-center gap-6 mb-8">
          <a href="https://www.instagram.com/passion4jerseys.ro/" target="_blank" className="bg-white/10 p-3 rounded-full text-white hover:bg-pink-600 transition duration-300"><FaInstagram className="text-xl" /></a>
          <a href="https://www.tiktok.com/@passion4jerseys.ro" target="_blank" className="bg-white/10 p-3 rounded-full text-white hover:bg-white hover:text-black transition duration-300"><FaTiktok className="text-xl" /></a>
          <a href="https://www.facebook.com/" target="_blank" className="bg-white/10 p-3 rounded-full text-white hover:bg-blue-600 transition duration-300"><FaFacebookF className="text-xl" /></a>
        </div>
        
        <p className="mb-6 text-gray-500">© 2025 Passion4Jerseys. Toate drepturile rezervate.</p>
        
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <Link href="/termeni" className="hover:text-white transition">Termeni și Condiții</Link>
          <Link href="/confidentialitate" className="hover:text-white transition">Politica de Confidențialitate</Link>
          <Link href="/retur" className="hover:text-white transition">Politica de Retur</Link>
          <Link href="/contact" className="hover:text-white transition">Contact</Link>
        </div>

        <div className="flex justify-center mb-8">
          <iframe src="https://mny.ro/npId.html?color=%23000000&version=orizontal&secret=157332" title="NETOPIA Payments" style={{ border: 'none', width: '480px', height: '60px', overflow: 'hidden' }} />
        </div>

        <div className="flex justify-center gap-4 opacity-70 hover:opacity-100 transition-opacity">
          <a href="https://anpc.ro/ce-este-sal/" target="_blank"><img src="/images/sal.png" alt="ANPC SAL" className="h-8 md:h-10 w-auto" /></a>
          <a href="https://europa.eu/youreurope/business/dealing-with-customers/solving-disputes/alternative-dispute-resolution/index_ro.html" target="_blank"><img src="/images/sol.png" alt="ANPC SOL" className="h-8 md:h-10 w-auto" /></a>
        </div>

        <div className="mt-6 text-xs text-gray-700">
          <p>Imaginile produselor sunt cu titlu de prezentare.</p>
        </div>
      </footer>
    </>
  );
}