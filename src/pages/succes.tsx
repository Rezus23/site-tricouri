import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/router";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import BlurredBackground from "@/components/BlurredBackground";

export default function Succes() {
  // 1. Preluăm funcția golesteCos din context
  const { golesteCos } = useCart();
  
  const router = useRouter();
  const { orderId } = router.query; 

  const [status, setStatus] = useState("verificare"); // verificare | success | failed

  useEffect(() => {
    if (!router.isReady) return;

    if (!orderId) {
       // router.push("/"); // Opțional: redirect dacă intră fără ID
       return;
    }

    // Ascultăm comanda în timp real
    const unsub = onSnapshot(doc(db, "orders", orderId as string), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // 2. LOGICA DE GOLIRE COȘ
        if (data?.status === "completed") {
          setStatus("success");
          
          // 👇 AICI SE ÎNTÂMPLĂ MAGIA!
          // Golim coșul doar când vedem că banii au ajuns (status completed)
          golesteCos(); 
          
          // Opțional: Curățăm și din localStorage orice urmă a comenzii temporare
          localStorage.removeItem("comanda_asteptare"); 

        } else if (data?.status === "rejected" || data?.status === "failed") {
          router.push("/esuat");
        }
      }
    });

    // Timeout de siguranță (15 secunde)
    const timeout = setTimeout(() => {
      setStatus((currentStatus) => {
        if (currentStatus !== "success") {
            // Dacă după 15 secunde tot nu e completed, trimitem la eșuat
            router.push("/esuat");
        }
        return currentStatus;
      });
    }, 15000);

    return () => {
        unsub();
        clearTimeout(timeout);
    };
  }, [router.isReady, orderId, golesteCos, router]); // Adăugăm golesteCos la dependențe

  // --- UI LOADING ---
  if (status === "verificare") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative">
        <BlurredBackground />
        <div className="bg-white/90 p-8 rounded-2xl shadow-xl text-center backdrop-blur-md">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-800">Verificăm plata...</h2>
            <p className="text-gray-500 text-sm mt-2">Vă rugăm așteptați confirmarea.</p>
        </div>
      </div>
    );
  }

  // --- UI SUCCES ---
  return (
    <div className="min-h-screen relative">
      <BlurredBackground />
      
      <div className="flex flex-col items-center justify-center min-h-screen p-4 relative z-10">
        <div className="bg-white/95 backdrop-blur-md p-10 rounded-2xl shadow-2xl text-center max-w-lg border border-white/50 animate-in fade-in zoom-in duration-500">
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6 shadow-inner">
                <span className="text-5xl">🎉</span>
            </div>
            
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Plată Reușită!</h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Comanda ta a fost înregistrată cu succes. <br/>
                Ți-am trimis detaliile pe email.
            </p>
            
            <Link 
                href="/contul_meu" 
                className="inline-block w-full bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition transform hover:scale-105 shadow-lg"
            >
                Vezi Comanda în Contul Meu
            </Link>
            
            <Link href="/" className="block mt-6 text-gray-400 hover:text-gray-600 text-sm font-medium">
                Înapoi la Magazin
            </Link>
        </div>
      </div>
    </div>
  );
}