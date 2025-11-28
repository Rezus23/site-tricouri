import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "@/components/Layout";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext"; 
import Navbar from "@/components/Navbar";
import CartPopup from "@/components/CartPopup";


export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <CartProvider>
        <Layout>
          <Navbar />
          <CartPopup />
          <Component {...pageProps} />
        </Layout>
      </CartProvider>
    </AuthProvider>
  );
}