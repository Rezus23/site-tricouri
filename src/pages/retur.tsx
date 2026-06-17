import Head from "next/head";
import Link from "next/link";

export default function Retur() {
  return (
    <div className="bg-white text-gray-800 font-sans min-h-screen pt-32 pb-20 px-6">
      <Head>
        <title>Politica de Retur | Passion4Jerseys</title>
        <meta name="description" content="Informații despre dreptul de retragere și procedura de retur." />
      </Head>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 border-b pb-4 text-gray-900">Politica de Retur</h1>

        <div className="space-y-6">
           <p>Conform legii, aveți dreptul de a returna produsele în termen de 14 zile.</p>
           {/* ... Restul textului legal ... */}
        </div>
        
        <div className="mt-12 text-center">
            <Link href="/" className="text-blue-600 hover:underline font-medium">
                ← Înapoi la pagina principală
            </Link>
        </div>
      </div>
    </div>
  );
}