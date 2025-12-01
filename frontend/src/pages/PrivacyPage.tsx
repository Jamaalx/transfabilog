import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.webp" alt="Floteris" className="h-8 w-8" />
            <span className="text-xl font-bold text-slate-900">Floteris</span>
          </Link>
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Înapoi la pagina principală
            </Link>
          </Button>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Politica de Confidențialitate</h1>

        <div className="prose prose-slate max-w-none">
          <p className="text-slate-500 mb-8">Ultima actualizare: 1 Decembrie 2025</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Introducere</h2>
            <p className="text-slate-600 mb-4">
              FORTITUDO VINCIT SRL ("Compania", "noi") se angajează să protejeze confidențialitatea datelor
              dumneavoastră. Această Politică de Confidențialitate explică cum colectăm, utilizăm, stocăm
              și protejăm informațiile dumneavoastră personale atunci când utilizați platforma Floteris.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Date Colectate</h2>
            <p className="text-slate-600 mb-4">Colectăm următoarele categorii de date:</p>

            <h3 className="text-lg font-medium mb-2 mt-4">Date de identificare:</h3>
            <ul className="list-disc pl-6 text-slate-600 space-y-1">
              <li>Nume și prenume</li>
              <li>Adresa de email</li>
              <li>Număr de telefon</li>
              <li>Numele companiei</li>
            </ul>

            <h3 className="text-lg font-medium mb-2 mt-4">Date operaționale:</h3>
            <ul className="list-disc pl-6 text-slate-600 space-y-1">
              <li>Informații despre vehicule (numere înmatriculare, documente)</li>
              <li>Date despre șoferi (permise, atestate)</li>
              <li>Documente încărcate (facturi, CMR-uri)</li>
              <li>Tranzacții carburant</li>
            </ul>

            <h3 className="text-lg font-medium mb-2 mt-4">Date tehnice:</h3>
            <ul className="list-disc pl-6 text-slate-600 space-y-1">
              <li>Adresa IP</li>
              <li>Tipul browserului</li>
              <li>Date de acces și utilizare</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Scopul Prelucrării</h2>
            <p className="text-slate-600 mb-4">Utilizăm datele dumneavoastră pentru:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Furnizarea și îmbunătățirea Serviciului</li>
              <li>Procesarea automată a documentelor</li>
              <li>Generarea rapoartelor și alertelor</li>
              <li>Comunicări referitoare la cont și serviciu</li>
              <li>Suport tehnic și asistență</li>
              <li>Conformitate legală</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Temeiul Legal</h2>
            <p className="text-slate-600 mb-4">Prelucrăm datele dumneavoastră pe baza:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li><strong>Executarea contractului</strong> - pentru furnizarea serviciului</li>
              <li><strong>Consimțământul</strong> - pentru comunicări de marketing</li>
              <li><strong>Interesul legitim</strong> - pentru îmbunătățirea serviciului</li>
              <li><strong>Obligație legală</strong> - pentru conformitate cu legea</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Partajarea Datelor</h2>
            <p className="text-slate-600 mb-4">Putem partaja datele cu:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li><strong>Furnizori de servicii</strong> - pentru hosting, procesare plăți, etc.</li>
              <li><strong>Parteneri de integrare</strong> - DKV, Eurowag, etc. (doar cu acordul dumneavoastră)</li>
              <li><strong>Autorități</strong> - când legea o impune</li>
            </ul>
            <p className="text-slate-600 mt-4">
              Nu vindem și nu închiriem datele dumneavoastră personale terților.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Stocare și Securitate</h2>
            <p className="text-slate-600 mb-4">
              Datele dumneavoastră sunt stocate pe servere securizate din Uniunea Europeană.
              Implementăm măsuri tehnice și organizatorice adecvate:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Criptare SSL/TLS pentru transferuri</li>
              <li>Criptare AES-256 pentru date stocate</li>
              <li>Acces restricționat pe bază de roluri</li>
              <li>Backup-uri zilnice</li>
              <li>Monitorizare continuă a securității</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Perioada de Retenție</h2>
            <p className="text-slate-600">
              Păstrăm datele dumneavoastră cât timp contul este activ și pentru o perioadă
              rezonabilă după aceea pentru conformitate legală, rezolvarea disputelor și
              prevenirea fraudei. Datele pot fi șterse la cerere, cu excepția celor pe care
              suntem obligați legal să le păstrăm.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Drepturile Dumneavoastră</h2>
            <p className="text-slate-600 mb-4">Conform GDPR, aveți dreptul la:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li><strong>Acces</strong> - să solicitați o copie a datelor</li>
              <li><strong>Rectificare</strong> - să corectați datele inexacte</li>
              <li><strong>Ștergere</strong> - să solicitați ștergerea datelor</li>
              <li><strong>Portabilitate</strong> - să primiți datele în format structurat</li>
              <li><strong>Opoziție</strong> - să vă opuneți prelucrării</li>
              <li><strong>Restricționare</strong> - să limitați prelucrarea</li>
            </ul>
            <p className="text-slate-600 mt-4">
              Pentru a vă exercita drepturile, contactați-ne la contact@zed-zen.com.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Cookie-uri</h2>
            <p className="text-slate-600">
              Utilizăm cookie-uri esențiale pentru funcționarea platformei și cookie-uri
              analitice pentru a înțelege cum este utilizat serviciul. Puteți gestiona
              preferințele de cookie-uri din setările browserului.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. Modificări</h2>
            <p className="text-slate-600">
              Putem actualiza această politică periodic. Veți fi notificat despre modificări
              semnificative prin email sau notificare în aplicație.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">11. Contact</h2>
            <p className="text-slate-600">
              Pentru orice întrebări privind confidențialitatea datelor:
            </p>
            <ul className="list-none text-slate-600 mt-4 space-y-2">
              <li><strong>Email:</strong> contact@zed-zen.com</li>
              <li><strong>Telefon:</strong> +40 757 314 021</li>
              <li><strong>Companie:</strong> FORTITUDO VINCIT SRL</li>
            </ul>
            <p className="text-slate-600 mt-4">
              De asemenea, aveți dreptul să depuneți o plângere la Autoritatea Națională de
              Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP).
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          © 2025 FORTITUDO VINCIT SRL. Toate drepturile rezervate.
        </div>
      </footer>
    </div>
  )
}
