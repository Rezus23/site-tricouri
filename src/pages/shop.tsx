import { useCart } from "@/context/CartContext";
import Link from "next/link";
import Image from 'next/image';

const produse = [
  {
    id: 1,
    titlu: "Tricou Real Madrid",
    pret: "129.99",
    img: "/images/real-madrid.jpeg",
  },
  {
    id: 2,
    titlu: "Tricou FC Barcelona",
    pret: "124.99",
    img: "/images/barcelona.jpeg",
  },
  {
    id: 3,
    titlu: "Tricou Manchester City",
    pret: "139.99",
    img: "/images/man-city.jpg",
  },
  {
    id: 4,
    titlu: "Tricou PSG",
    pret: "119.99",
    img: "/images/psg.jpg",
  },
  {
    id: 5,
    titlu: "Tricou Juventus",
    pret: "0.99",
    img: "/images/juventus.jpg",
  },
];

export default function Shop() {
  const {  } = useCart();

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
        Produse disponibile
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {produse.map((produs) => (
          <div
            key={produs.id}
            className="bg-white shadow-md rounded-lg p-4 flex flex-col justify-between"
          >
            <Link href={`/magazin/${produs.id}`}>
              <Image
                src={produs.img}
                alt={produs.titlu}
                width={500}
                height={300}
                className="w-full h-80 object-cover mb-4 rounded cursor-pointer"
              />
            </Link>

            <div className="flex-grow">
              <Link href={`/magazin/${produs.id}`}>
                <h2 className="text-xl font-semibold mb-2 hover:underline cursor-pointer">
                  {produs.titlu}
                </h2>
              </Link>
              <p className="text-gray-600 mb-4">{produs.pret} RON</p>
            </div>

            
          </div>
        ))}
      </div>
    </div>
  );
}