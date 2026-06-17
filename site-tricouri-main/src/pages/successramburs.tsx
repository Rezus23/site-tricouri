import Link from "next/link";
import { FiCheckCircle, FiShoppingBag, FiArrowRight } from "react-icons/fi";
import Head from "next/head";

export default function Success() {
  return (
    <>
      <Head>
        <title>Comandă Confirmată - Passion4Jerseys</title>
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        
        {/* Cardul de Succes */}
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl max-w-lg w-full text-center border border-gray-100 relative overflow-hidden">
          
          {/* Element decorativ fundal */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>

          {/* Iconița Animată */}
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                <FiCheckCircle className="text-6xl text-green-500" />
            </div>
          </div>

          {/* 👇 TITLUL CERUT DE TINE */}
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 tracking-tight uppercase">
            Comanda este confirmată!
          </h1>

          {/* 👇 SUBTEXTUL CERUT DE TINE */}
          <p className="text-gray-500 text-lg mb-8 leading-relaxed">
            Ți-am trimis detaliile pe email.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-200 text-sm text-gray-600">
            <p className="font-bold text-gray-900 mb-1">Ce urmează?</p>
            <p>Echipa noastră va pregăti coletul și îl va preda curierului în cel mai scurt timp.</p>
          </div>

          <div className="flex flex-col gap-3">
            <Link 
                href="/shop" 
                className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
            >
                <FiShoppingBag /> Continuă Cumpărăturile
            </Link>

            <Link 
                href="/" 
                className="w-full bg-white text-gray-900 py-4 rounded-xl font-bold text-lg border border-gray-200 hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
                Înapoi Acasă <FiArrowRight />
            </Link>
          </div>

        </div>

        <p className="mt-8 text-gray-400 text-sm">
          Ai nevoie de ajutor? <Link href="/contact" className="text-blue-500 hover:underline">Contactează-ne</Link>
        </p>
      </div>
    </>
  );
}