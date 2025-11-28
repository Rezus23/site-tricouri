import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "@/components/Layout";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext"; 
import Navbar from "@/components/Navbar";


export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <CartProvider>
        <Layout>
          <Navbar />
          <Component {...pageProps} />
        </Layout>
      </CartProvider>
    </AuthProvider>
  );
}