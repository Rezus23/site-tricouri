import { useCart } from '@/context/CartContext'; 
import { useEffect } from 'react';


export default function Succes() {
  const { golesteCos } = useCart(); // 👈 Preluăm funcția

  useEffect(() => {
    // Aici se execută logica de finalizare, actualizare Firebase, etc.
    // ...

    // Odată ce plata este confirmată și statusul e actualizat:
    golesteCos(); // 👈 Aici se golește coșul

    // ...
  }, [golesteCos]);
  return (
    <div className="max-w-2xl mx-auto p-10 text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">✅ Comanda ta a fost plasată!</h1>
      <p className="text-lg">Vei primi un email cu detaliile comenzii în scurt timp.</p>
    </div>
  );
}