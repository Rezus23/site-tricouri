import { useState } from "react";
import Head from "next/head";
import { FaPhone, FaEnvelope, FaInstagram, FaTiktok, FaFacebookF, FaWhatsapp, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import BlurredBackground from "@/components/BlurredBackground"; // Asigură-te că ai componenta asta, dacă nu, șterge linia și tag-ul

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Funcție simulată de trimitere (o poți lega de EmailJS sau Firebase mai târziu)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulăm o trimitere de 1.5 secunde
    setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        // Aici poți reseta formularul dacă vrei
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      <Head>
        <title>Contact - Passion4Jerseys</title>
        <meta name="description" content="Contactează echipa Passion4Jerseys pentru comenzi custom și informații." />
      </Head>

      {/* Fundal Blur (Opțional, dacă ai componenta) */}
      <BlurredBackground />

      <div className="relative z-10 container mx-auto px-6 pt-32 pb-20">
        
        {/* Titlu */}
        <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
                Contactează<span className="text-blue-600">-ne</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Ai o întrebare despre o comandă sau vrei un tricou custom? 
                Suntem aici să te ajutăm!
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            
            {/* --- COLOANA STÂNGA: INFORMAȚII --- */}
            <div className="space-y-8">
                
                {/* Card Telefon (Evidențiat) */}
                <div className="bg-[#111] p-8 rounded-2xl border border-gray-800 flex items-start gap-6 hover:border-blue-600 transition duration-300 group">
                    <div className="bg-blue-600/20 p-4 rounded-full text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition">
                        <FaPhone className="text-2xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold uppercase mb-1">Telefon / WhatsApp</h3>
                        <p className="text-gray-400 text-sm mb-3">Răspundem rapid la mesaje.</p>
                        <a href="tel:0771401660" className="text-2xl font-black text-white tracking-wider hover:text-blue-500 transition">
                            0771 401 660
                        </a>
                        <div className="mt-3">
                            <a 
                                href="https://wa.me/40771401660" 
                                target="_blank" 
                                className="inline-flex items-center gap-2 text-green-500 font-bold text-sm hover:underline"
                            >
                                <FaWhatsapp className="text-lg" /> Scrie-ne pe WhatsApp
                            </a>
                        </div>
                    </div>
                </div>

                {/* Card Email */}
                <div className="bg-[#111] p-8 rounded-2xl border border-gray-800 flex items-start gap-6 hover:border-purple-600 transition duration-300 group">
                    <div className="bg-purple-600/20 p-4 rounded-full text-purple-500 group-hover:bg-purple-600 group-hover:text-white transition">
                        <FaEnvelope className="text-2xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold uppercase mb-1">Email</h3>
                        <p className="text-gray-400 text-sm mb-2">Pentru colaborări sau probleme comenzi.</p>
                        <a href="mailto:passion4jerseys@gmail.com" className="text-lg font-bold text-white hover:text-purple-500 transition">
                            passion4jerseys@gmail.com
                        </a>
                    </div>
                </div>

                {/* Program & Social */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-[#111] p-6 rounded-2xl border border-gray-800">
                        <div className="flex items-center gap-3 mb-4 text-gray-300">
                            <FaClock /> <span className="font-bold uppercase">Program</span>
                        </div>
                        <ul className="text-sm text-gray-400 space-y-2">
                            <li className="flex justify-between"><span>Luni - Vineri:</span> <span className="text-white">10:00 - 18:00</span></li>
                            <li className="flex justify-between"><span>Sâmbătă:</span> <span className="text-white">10:00 - 14:00</span></li>
                            <li className="flex justify-between"><span>Duminică:</span> <span className="text-red-500">Închis</span></li>
                        </ul>
                    </div>

                    <div className="bg-[#111] p-6 rounded-2xl border border-gray-800 flex flex-col justify-center items-center">
                        <p className="font-bold uppercase mb-4 text-gray-300">Urmărește-ne</p>
                        <div className="flex gap-4">
                            <a href="https://instagram.com/passion4jerseys.ro" target="_blank" className="bg-white/10 p-3 rounded-full hover:bg-pink-600 transition hover:scale-110"><FaInstagram className="text-xl"/></a>
                            <a href="https://tiktok.com/@passion4jerseys.ro" target="_blank" className="bg-white/10 p-3 rounded-full hover:bg-white hover:text-black transition hover:scale-110"><FaTiktok className="text-xl"/></a>
                            <a href="https://facebook.com" target="_blank" className="bg-white/10 p-3 rounded-full hover:bg-blue-600 transition hover:scale-110"><FaFacebookF className="text-xl"/></a>
                        </div>
                    </div>
                </div>

            </div>

            {/* --- COLOANA DREAPTA: FORMULAR --- */}
            <div className="bg-white/5 backdrop-blur-sm p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl">
                <h3 className="text-2xl font-black uppercase mb-6">Trimite un mesaj</h3>
                
                {success ? (
                    <div className="bg-green-500/20 border border-green-500 text-green-400 p-6 rounded-xl text-center animate-in fade-in zoom-in">
                        <h4 className="text-xl font-bold mb-2">Mesaj Trimis! ✅</h4>
                        <p>Îți mulțumim! Te vom contacta în cel mai scurt timp posibil.</p>
                        <button onClick={() => setSuccess(false)} className="mt-4 text-sm underline hover:text-white">Trimite alt mesaj</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-2 ml-1">Numele tău</label>
                                <input required type="text" placeholder="ex: Andrei Popescu" className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-2 ml-1">Telefon</label>
                                <input required type="tel" placeholder="07xx xxx xxx" className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-400 mb-2 ml-1">Adresă Email</label>
                            <input required type="email" placeholder="nume@email.com" className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-400 mb-2 ml-1">Mesajul tău</label>
                            <textarea required rows={4} placeholder="Salut, aș vrea să comand un tricou custom..." className="w-full bg-black/50 border border-gray-700 rounded-xl p-4 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition resize-none"></textarea>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-white text-black font-black py-4 rounded-xl uppercase tracking-widest hover:bg-gray-200 transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Se trimite..." : "Trimite Mesajul"}
                        </button>
                        
                        <p className="text-xs text-gray-500 text-center">
                            Prin trimiterea formularului ești de acord cu politica de confidențialitate.
                        </p>
                    </form>
                )}
            </div>

        </div>
      </div>
    </div>
  );
}