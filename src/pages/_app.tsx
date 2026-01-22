import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "@/components/Layout";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext"; 
import Navbar from "@/components/Navbar";
import CartPopup from "@/components/CartPopup";
import { Oswald, Inter } from "next/font/google"; 
import Head from "next/head"; 

const oswald = Oswald({ subsets: ["latin"], weight: ["400", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <CartProvider>
        {/* Schimbăm și aici: folosim max-w-full în loc de 100vw */}
        <div className={`${inter.className} relative w-full max-w-full`}>
          
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
          </Head>

          <style jsx global>{`
            h1, h2, h3, h4, h5, h6 {
              font-family: ${oswald.style.fontFamily}, sans-serif;
              text-transform: uppercase;
            }
            /* Forțăm body-ul să nu iasă din ecran */
            html, body {
              width: 100%;
              overflow-x: hidden;
              position: relative;
            }
          `}</style>

          <Layout>
            <Navbar />
            <CartPopup />
            
            {/* 👇 AICI ERA PROBLEMA: Am șters max-w-[100vw] și am pus w-full */}
            <main className="flex flex-col min-h-screen w-full overflow-x-hidden">
              <Component {...pageProps} />
            </main>
          </Layout>

        </div>
      </CartProvider>
    </AuthProvider>
  );
}