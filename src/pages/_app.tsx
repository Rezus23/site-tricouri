import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "@/components/Layout";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext"; 
import Navbar from "@/components/Navbar";
import CartPopup from "@/components/CartPopup";
import { Oswald, Inter } from "next/font/google"; // 👈 Import Fonturi
import Head from "next/head"; // 👈 Import Head pentru setări mobile

// 1. Configurăm Fonturile
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <CartProvider>
        {/* 2. Wrapper Principal: Aplică fontul Inter și taie scroll-ul orizontal */}
        <div className={`${inter.className} relative w-full overflow-x-hidden`}>
          
          <Head>
            {/* Previne zoom-ul nedorit pe input-uri pe mobil */}
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
          </Head>

          {/* 3. Stiluri Globale pentru Titluri (Oswald) și Siguranță Scroll */}
          <style jsx global>{`
            h1, h2, h3, h4, h5, h6 {
              font-family: ${oswald.style.fontFamily}, sans-serif;
              text-transform: uppercase;
            }
            html, body {
              max-width: 100%;
              overflow-x: hidden;
            }
          `}</style>

          <Layout>
            <Navbar />
            <CartPopup />
            
            {/* 4. Container Main: Asigură că nicio pagină nu iese din ecran */}
            <main className="flex flex-col min-h-screen w-full max-w-[100vw] overflow-x-hidden">
              <Component {...pageProps} />
            </main>
          </Layout>

        </div>
      </CartProvider>
    </AuthProvider>
  );
}