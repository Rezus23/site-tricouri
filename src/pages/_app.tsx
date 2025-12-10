import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Oswald, Inter } from "next/font/google";
import Head from "next/head";

// Configurăm fonturile
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${inter.className} relative w-full overflow-x-hidden`}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <style jsx global>{`
        h1, h2, h3, h4, h5, h6 {
          font-family: ${oswald.style.fontFamily}, sans-serif;
          text-transform: uppercase;
        }
        /* Siguranță suplimentară */
        html, body {
          max-width: 100%;
          overflow-x: hidden;
        }
      `}</style>
      
      {/* 👇 AICI ESTE CHEIA: Containerul care taie tot ce e extra */}
      <main className="flex flex-col min-h-screen w-full max-w-[100vw] overflow-x-hidden">
        <Component {...pageProps} />
      </main>
    </div>
  );
}