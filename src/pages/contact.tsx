import Head from "next/head";
import { FaEnvelope, FaInstagram, FaFacebookF, FaTiktok, FaClock, FaPaperPlane } from "react-icons/fa";
import BlurredBackground from "@/components/BlurredBackground";

export default function Contact() {
  return (
    <div className="min-h-screen bg-black text-white relative">
      <Head>
        <title>Contact - Passion4Jerseys</title>
        <meta name="description" content="Contactează echipa Passion4Jerseys." />
      </Head>

      <BlurredBackground />

      <div className="relative z-10 container mx-auto px-6 pt-32 pb-20">
        
        {/* Titlu */}
        <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
                Contactează<span className="text-blue-600">-ne</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Ai o întrebare sau vrei un tricou custom? 
                Scrie-ne direct pe Instagram sau pe Email.
            </p>
        </div>

        {/* CONTAINER CENTRAT (FĂRĂ FORMULAR) */}
        <div className="max-w-3xl mx-auto space-y-8">
            
            {/* CARD INSTAGRAM */}
            <div className="bg-[#111] p-8 rounded-2xl border border-gray-800 flex items-start gap-6 hover:border-pink-600 transition duration-300 group">
                <div className="bg-pink-600/20 p-4 rounded-full text-pink-500 group-hover:bg-pink-600 group-hover:text-white transition">
                    <FaInstagram className="text-2xl" />
                </div>
                <div>
                    <h3 className="text-xl font-bold uppercase mb-1">Instagram</h3>
                    <p className="text-gray-400 text-sm mb-3">Vezi ultimele noutăți & Comenzi prin DM.</p>
                    
                    <a 
                        href="https://www.instagram.com/passion4jerseys.ro/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-2xl font-black text-white tracking-wider hover:text-pink-500 transition block"
                    >
                        @passion4jerseys.ro
                    </a>
                    
                    <div className="mt-3">
                        <a 
                            href="https://www.instagram.com/passion4jerseys.ro/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-400 font-bold text-sm hover:underline"
                        >
                            <FaPaperPlane className="text-xs" /> Trimite un Mesaj (DM)
                        </a>
                    </div>
                </div>
            </div>

            {/* CARD EMAIL */}
            <div className="bg-[#111] p-8 rounded-2xl border border-gray-800 flex items-start gap-6 hover:border-purple-600 transition duration-300 group">
                <div className="bg-purple-600/20 p-4 rounded-full text-purple-500 group-hover:bg-purple-600 group-hover:text-white transition">
                    <FaEnvelope className="text-2xl" />
                </div>
                <div>
                    <h3 className="text-xl font-bold uppercase mb-1">Email</h3>
                    <p className="text-gray-400 text-sm mb-2">Pentru colaborări sau suport comenzi.</p>
                    <a href="mailto:passion4jerseys@gmail.com" className="text-lg font-bold text-white hover:text-purple-500 transition">
                        passion4jerseys@gmail.com
                    </a>
                </div>
            </div>

            {/* PROGRAM & SOCIAL MEDIA (GRID MIC) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Program */}
                <div className="bg-[#111] p-6 rounded-2xl border border-gray-800">
                    <div className="flex items-center gap-3 mb-4 text-gray-300">
                        <FaClock /> <span className="font-bold uppercase">Program Online</span>
                    </div>
                    <ul className="text-sm text-gray-400 space-y-2">
                        <li className="flex justify-between"><span>Luni - Duminică:</span> <span className="text-white font-bold">11:00 - 17:00</span></li>
                    </ul>
                </div>

                {/* Social Buttons */}
                <div className="bg-[#111] p-6 rounded-2xl border border-gray-800 flex flex-col justify-center items-center">
                    <p className="font-bold uppercase mb-4 text-gray-300">Social Media</p>
                    <div className="flex gap-4">
                        <a href="https://instagram.com/passion4jerseys.ro" target="_blank" className="bg-white/10 p-3 rounded-full hover:bg-pink-600 transition hover:scale-110"><FaInstagram className="text-xl"/></a>
                        <a href="https://tiktok.com/@passion4jerseys.ro" target="_blank" className="bg-white/10 p-3 rounded-full hover:bg-white hover:text-black transition hover:scale-110"><FaTiktok className="text-xl"/></a>
                        <a href="https://facebook.com" target="_blank" className="bg-white/10 p-3 rounded-full hover:bg-blue-600 transition hover:scale-110"><FaFacebookF className="text-xl"/></a>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}