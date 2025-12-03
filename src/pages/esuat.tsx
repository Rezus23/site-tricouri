import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import { FiXCircle, FiRefreshCw, FiHome } from "react-icons/fi";

export default function Esuat() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center font-sans">
      <Head>
        <title>Plată Eșuată | Passion4Jerseys</title>
      </Head>

      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full border border-red-100 animate-in zoom-in duration-300">
        
        {/* Iconiță Roșie Mare */}
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-50 mb-6 shadow-sm">
          <FiXCircle className="text-6xl text-red-600" />
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Ceva nu a mers bine</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Tranzacția nu a putut fi finalizată sau a fost anulată. 
          <br/>
          <strong>Nu ți-au fost retrași bani din cont.</strong>
        </p>

        <div className="flex flex-col gap-4">
          {/* Buton Principal: Încearcă din nou (Trimite la Coș sau direct la Adresă) */}
          <button 
            onClick={() => router.push('/checkout/adresa')} // Sau '/cart'
            className="w-full bg-red-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-red-700 transition transform active:scale-95 shadow-lg shadow-red-200 flex items-center justify-center gap-2"
          >
            <FiRefreshCw className="text-xl" />
            Încearcă din nou
          </button>
          
          {/* Link Secundar */}
          <Link 
            href="/" 
            className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-800 text-sm font-medium transition py-2"
          >
            <FiHome />
            Înapoi la Magazin
          </Link>
        </div>

      </div>
    </div>
  );
}