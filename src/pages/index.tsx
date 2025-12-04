import Link from "next/link";
import Head from "next/head";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa"; // 👈 IMPORT NOU

export default function Home() {
  return (
    <>
      {/* ... Head și Hero Section rămân la fel ... */}

      {/* --- FOOTER --- */}
      <footer className="bg-[#0a0a0a] py-12 text-center text-gray-500 text-sm border-t border-gray-900 mt-auto w-full">

          

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
    </>
  );
}