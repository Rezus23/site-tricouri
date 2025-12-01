import { FiX } from "react-icons/fi";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SizeChart({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
      
      {/* Fundal întunecat (click să închizi) */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Fereastra Pop-up */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden border border-gray-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">📏 Ghid Mărimi (Tricouri)</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition text-xl">
            <FiX />
          </button>
        </div>

        {/* Tabel */}
        <div className="p-5">
          <p className="text-xs text-gray-500 mb-4">Dimensiunile sunt aproximative (±2cm). Măsurătorile sunt pentru produsul întins pe masă.</p>
          
          <table className="w-full text-sm text-left text-gray-600 border-collapse">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Mărime</th>
                <th className="px-4 py-3">Piept (cm)</th>
                <th className="px-4 py-3 rounded-r-lg">Lungime (cm)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-bold">S</td>
                <td className="px-4 py-3">49-51</td>
                <td className="px-4 py-3">70-72</td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-bold">M</td>
                <td className="px-4 py-3">51-53</td>
                <td className="px-4 py-3">72-74</td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-bold">L</td>
                <td className="px-4 py-3">53-55</td>
                <td className="px-4 py-3">74-76</td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-bold">XL</td>
                <td className="px-4 py-3">55-57</td>
                <td className="px-4 py-3">76-78</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-bold">XXL</td>
                <td className="px-4 py-3">57-60</td>
                <td className="px-4 py-3">78-80</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-100">
             💡 <strong>Sfat:</strong> Dacă ești între mărimi, recomandăm să alegi mărimea mai mare pentru o potrivire relaxată.
          </div>
        </div>
      </div>
    </div>
  );
}