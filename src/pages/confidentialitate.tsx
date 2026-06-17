import Head from "next/head";
import Link from "next/link";

export default function Confidentialitate() {
  return (
    <div className="bg-white text-gray-800 font-sans min-h-screen pt-32 pb-20">
      <Head>
        <title>Politica de Confidențialitate | Passion4Jerseys</title>
        <meta name="description" content="Cum prelucrăm datele tale personale la Passion4Jerseys." />
      </Head>

      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-8 border-b pb-4 text-gray-900">Politica de Confidențialitate</h1>

        <div className="space-y-8 text-sm md:text-base leading-relaxed text-gray-700">
          
      

          <section>
            <h2 className="text-xl font-bold mb-3 text-gray-900">• Ce date colectăm?</h2>
            <p>
              Colectăm doar datele strict necesare pentru procesarea comenzilor și îmbunătățirea experienței pe site:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Date de identificare:</strong> Nume, prenume.</li>
              <li><strong>Date de contact:</strong> Adresă de email, număr de telefon, adresa de livrare.</li>
              <li><strong>Date tehnice:</strong> Adresa IP, tipul browserului (colectate automat prin cookie-uri pentru funcționarea site-ului).</li>
            </ul>
            <p className="mt-2 text-red-600 font-bold">
              ⚠️ IMPORTANT: Nu colectăm și nu stocăm datele cardului bancar! 
              Plățile sunt procesate exclusiv prin partenerul nostru securizat, Netopia Payments.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-gray-900">• Scopul colectării datelor</h2>
            <p>Folosim datele dumneavoastră pentru:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Procesarea și livrarea comenzilor.</li>
              <li>Comunicarea cu privire la statusul comenzii (emailuri de confirmare, AWB).</li>
              <li>Rezolvarea anulărilor sau a problemelor de orice natură referitoare la o comandă.</li>
              <li>Respectarea obligațiilor legale (ex: facturare și contabilitate).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-gray-900">• Cui transmitem datele?</h2>
            <p>
              Datele dvs. nu sunt vândute către terți. Ele sunt transmise doar partenerilor noștri de încredere, strict pentru îndeplinirea serviciilor:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Firme de curierat:</strong> (Ex: Fan Courier, Sameday) – pentru a livra coletul.</li>
              <li><strong>Procesatorul de plăți:</strong> (Netopia Payments) – pentru a confirma tranzacția.</li>
              <li><strong>Furnizori servicii IT:</strong> (Ex: Google Firebase, Vercel) – pentru găzduirea și funcționarea site-ului.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-gray-900">• Drepturile Dumneavoastră (GDPR)</h2>
            <p>Conform Regulamentului 2016/679/UE, aveți următoarele drepturi:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Dreptul de acces la date (să știți ce date avem despre voi).</li>
              <li>Dreptul la rectificare (să corectați datele greșite).</li>
              <li>Dreptul la ștergerea datelor ("dreptul de a fi uitat"), în măsura în care nu contravine legii fiscale.</li>
              <li>Dreptul de a vă opune prelucrării.</li>
            </ul>
            <p className="mt-2">
              Pentru a exercita aceste drepturi, ne puteți trimite o cerere scrisă la adresa de email: <strong>passion4jerseys@gmail.com</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-gray-900">6. Securitatea Datelor</h2>
            <p>
              Site-ul nostru folosește criptare SSL (Secure Socket Layer) pentru a proteja informațiile transmise între browserul dvs. și serverele noastre. 
              Baza de date este securizată conform standardelor industriei (Google Cloud Platform).
            </p>
          </section>

        </div>

        <div className="mt-12 border-t pt-6 text-center">
            <Link href="/" className="text-blue-600 hover:underline">
                ← Înapoi la pagina principală
            </Link>
        </div>

      </div>
    </div>
  );
}