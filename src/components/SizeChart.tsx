import { FiX } from "react-icons/fi";

// Tipul pentru datele primite
type MarimeData = {
  nume: string;
  piept?: number;
  lungime?: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  marimi?: MarimeData[]; // 👈 Primim lista de mărimi a produsului
};

export default function SizeChart({ isOpen, onClose, marimi }: Props) {
  if (!isOpen) return null;

  // Dacă produsul nu are dimensiuni setate, afișăm un mesaj
  const areDimensiuni = marimi && marimi.some(m => m.piept || m.lungime);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden border border-gray-200">
        
        <div className="flex justify-between items-center p-5 border-b bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">📏 Ghid Mărimi (cm)</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition text-xl"><FiX /></button>
        </div>

        <div className="p-5">
          {!areDimensiuni ? (
            <div className="text-center text-gray-500 py-4">
                <p>Nu există dimensiuni specifice pentru acest produs.</p>
                <p className="text-xs mt-2">Te rugăm să ne contactezi pentru detalii.</p>
            </div>
          ) : (
            <>
                <p className="text-xs text-gray-500 mb-4">Măsurători aproximative ale produsului întins pe masă.</p>
                <table className="w-full text-sm text-left text-gray-600 border-collapse">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>
                        <th className="px-4 py-3 rounded-l-lg">Mărime</th>
                        <th className="px-4 py-3">Piept (cm)</th>
                        <th className="px-4 py-3 rounded-r-lg">Lungime (cm)</th>
                    </tr>
                    </thead>
                    <tbody>
                    {marimi?.map((m) => (
                        <tr key={m.nume} className="border-b hover:bg-gray-50 last:border-b-0">
                            <td className="px-4 py-3 font-bold text-black">{m.nume}</td>
                            <td className="px-4 py-3">{m.piept || "-"}</td>
                            <td className="px-4 py-3">{m.lungime || "-"}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}