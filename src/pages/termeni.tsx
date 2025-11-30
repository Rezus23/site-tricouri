import Head from "next/head";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function Termeni() {
  return (
    <div className="bg-white text-gray-800 font-sans">
      <Head>
        <title>Termeni și Condiții | Passion4Jerseys</title>
      </Head>

      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-12 pt-32">
        <h1 className="text-4xl font-bold mb-8 border-b pb-4">Termeni și Condiții</h1>

        <div className="space-y-6 text-sm md:text-base leading-relaxed">
          
          <section>
            <h2 className="text-xl font-bold mb-2">1. Dispoziții Generale</h2>
            <p>
              Site-ul <strong>passion4jerseys.ro</strong> este administrat de <strong>[NUMELE TĂU SAU NUMELE PFA-ULUI]</strong>, 
              având sediul social în <strong>[ADRESA TA DIN BULETIN/ACTE]</strong>, 
              înregistrată la Registrul Comerțului sub nr. <strong>[NUMĂR REG COM, EX: F40/...]</strong>, 
              având cod unic de înregistrare fiscală <strong>[CUI-ul TĂU]</strong>.
            </p>
            <p>
              Folosirea acestui site implică acceptarea termenilor și condițiilor de mai jos. Recomandăm citirea cu atenție a acestora. 
              Ne asumăm dreptul de a modifica aceste prevederi fără o altă notificare.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">2. Produsele și Serviciile</h2>
            <p>
              Passion4Jerseys comercializează articole sportive și tricouri de fotbal. Imaginile produselor sunt cu titlu de prezentare. 
              Din cauza setărilor monitorului sau a ecranului, culorile pot diferi ușor față de realitate.
            </p>
            <p>
              Prețurile afișate includ TVA (dacă ești plătitor, altfel șterge asta) și sunt exprimate în RON.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">3. Comanda</h2>
            <p>
              Clientul poate efectua comenzi pe site prin adăugarea produselor dorite în coșul de cumpărături și finalizarea procesului de plată. 
              Odată adăugat în coșul de cumpărături, un produs este disponibil pentru achiziție în măsura în care există stoc disponibil.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">4. Plată</h2>
            <p>
              Plata produselor se poate efectua online, cu cardul bancar, prin intermediul procesatorului de plăți <strong>Netopia Payments</strong>. 
              Datele cardului dumneavoastră nu sunt stocate de către noi, ci sunt procesate securizat de către Netopia.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">5. Livrare</h2>
            <p>
              Livrarea se face prin curier rapid (Fan Courier / Sameday) oriunde în România.
              Termenul estimativ de livrare este de <strong>2-5 zile</strong> lucrătoare de la confirmarea comenzii (excepţie face comanda personalizată, unde timpul de livrare este de aproximativ 12-15 zile lucrătoare).
              Costul transportului este afișat înainte de finalizarea comenzii (sau este gratuit peste o anumită sumă).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">6. Politica de Retur (Dreptul de retragere)</h2>
            <p>
              Conform OUG 34/2014, aveți dreptul de a vă retrage din contract (a returna produsul) în termen de <strong>14 zile calendaristice</strong>, fără a preciza motivele.
            </p>
            <p>
              Pentru a returna un produs, acesta trebuie să fie în aceeași stare în care a fost livrat (nepurtat, cu etichetele intacte). 
              Costul transportului pentru retur va fi suportat de către client. Banii vor fi returnați în contul bancar în termen de maxim 14 zile de la primirea returului.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">7. Garanții</h2>
            <p>
              Produsele comercializate beneficiază de condiții de garanție conform legislației în vigoare (Legea 449/2003). 
              Garanția comercială pentru produsele de îmbrăcăminte este de 30 de zile de la achiziție, pentru defecte de fabricație.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">8. Confidențialitate (GDPR)</h2>
            <p>
              Respectăm confidențialitatea datelor dumneavoastră. Datele personale colectate (nume, adresă, telefon, email) sunt folosite 
              strict pentru procesarea și livrarea comenzilor. Pentru mai multe detalii, consultați <Link href="/confidentialitate" className="text-blue-600 underline">Politica de Confidențialitate</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">9. Litigii</h2>
            <p>
              Orice litigiu apărut între Clienți și Societate va fi rezolvat pe cale amiabilă. 
              În cazul în care nu s-a reușit stingerea conflictului pe cale amiabilă, competența revine instanțelor de judecată din România.
            </p>
          </section>

        </div>
        
        {/* Link-uri ANPC obligatorii */}
        <div className="mt-12 flex flex-col gap-4 border-t pt-6">
            <a href="https://anpc.ro/ce-este-sal/" target="_blank" rel="noreferrer">
                <img src="https://wp.anpc.ro/wp-content/uploads/2023/02/sal.png" alt="ANPC SAL" className="h-10" />
            </a>
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer">
                <img src="https://wp.anpc.ro/wp-content/uploads/2023/02/sol.png" alt="ANPC SOL" className="h-10" />
            </a>
        </div>

      </div>
    </div>
  );
}