import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>Tricouri Fotbal</title>
        <meta name="description" content="Magazin online pentru fanii fotbalului" />
      </Head>
      <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 text-center bg-gray-100">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-700 mb-4">
          Bine ai venit la Passion4Jerseys!
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 max-w-xl mb-6">
          Alege tricoul echipei tale preferate și arată-ți susținerea oriunde te-ai afla!
        </p>
        <Link
          href="/shop"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 transition"
        >
          Vezi Magazinul
        </Link>
      </div>
    </>
  );
}