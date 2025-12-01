import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TermsPage() {
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
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Termeni și Condiții</h1>

        <div className="prose prose-slate max-w-none">
          <p className="text-slate-500 mb-8">Ultima actualizare: 1 Decembrie 2025</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Introducere</h2>
            <p className="text-slate-600 mb-4">
              Acești Termeni și Condiții ("Termenii") guvernează utilizarea platformei Floteris ("Platforma", "Serviciul"),
              operată de FORTITUDO VINCIT SRL ("Compania", "noi", "ne"). Prin accesarea sau utilizarea Platformei,
              sunteți de acord cu acești Termeni.
            </p>
            <p className="text-slate-600">
              Dacă nu sunteți de acord cu acești Termeni, vă rugăm să nu utilizați Platforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Descrierea Serviciului</h2>
            <p className="text-slate-600 mb-4">
              Floteris este o platformă de management a flotei auto care oferă:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Procesare automată a documentelor folosind tehnologie AI</li>
              <li>Import și reconciliere date carburant din diverse surse</li>
              <li>Monitorizare și alertare pentru documente (ITP, RCA, etc.)</li>
              <li>Rapoarte de profitabilitate și analiză</li>
              <li>Gestiune șoferi și vehicule</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Contul de Utilizator</h2>
            <p className="text-slate-600 mb-4">
              Pentru a utiliza Serviciul, trebuie să vă creați un cont. Sunteți responsabil pentru:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Menținerea confidențialității datelor de autentificare</li>
              <li>Toate activitățile care au loc sub contul dumneavoastră</li>
              <li>Notificarea imediată a oricărei utilizări neautorizate</li>
              <li>Furnizarea de informații exacte și actualizate</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Utilizare Acceptabilă</h2>
            <p className="text-slate-600 mb-4">
              Nu aveți voie să:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Utilizați Serviciul pentru scopuri ilegale</li>
              <li>Încercați să accesați neautorizat sistemele noastre</li>
              <li>Transmiteți viruși sau cod malițios</li>
              <li>Colectați date despre alți utilizatori fără consimțământ</li>
              <li>Revândeți sau redistribuiți Serviciul fără acordul nostru</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Plăți și Facturare</h2>
            <p className="text-slate-600 mb-4">
              Prețurile sunt afișate pe pagina de prețuri și pot fi modificate cu preaviz de 30 de zile.
              Facturarea se face lunar, în avans. Neplata poate rezulta în suspendarea contului.
            </p>
            <p className="text-slate-600">
              Oferim o perioadă de probă de 14 zile fără obligații.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Proprietate Intelectuală</h2>
            <p className="text-slate-600">
              Toate drepturile de proprietate intelectuală asupra Platformei aparțin FORTITUDO VINCIT SRL.
              Vi se acordă o licență limitată, neexclusivă pentru utilizarea Serviciului conform acestor Termeni.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Limitarea Răspunderii</h2>
            <p className="text-slate-600 mb-4">
              Serviciul este furnizat "așa cum este". Nu garantăm că va fi lipsit de erori sau întreruperi.
              În măsura maximă permisă de lege, nu suntem răspunzători pentru:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Pierderi indirecte sau consecvente</li>
              <li>Pierderi de profit sau date</li>
              <li>Întreruperi ale activității</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Încetare</h2>
            <p className="text-slate-600">
              Puteți înceta utilizarea Serviciului oricând prin anularea contului. Ne rezervăm dreptul
              de a suspenda sau închide contul dumneavoastră în caz de încălcare a acestor Termeni.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Modificări ale Termenilor</h2>
            <p className="text-slate-600">
              Ne rezervăm dreptul de a modifica acești Termeni. Veți fi notificat despre modificări
              semnificative cu cel puțin 30 de zile înainte. Continuarea utilizării după modificări
              constituie acceptarea noilor Termeni.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. Legea Aplicabilă</h2>
            <p className="text-slate-600">
              Acești Termeni sunt guvernați de legislația României. Orice dispută va fi soluționată
              de instanțele competente din București, România.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">11. Contact</h2>
            <p className="text-slate-600">
              Pentru orice întrebări referitoare la acești Termeni, ne puteți contacta la:
            </p>
            <ul className="list-none text-slate-600 mt-4 space-y-2">
              <li><strong>Email:</strong> contact@zed-zen.com</li>
              <li><strong>Telefon:</strong> +40 757 314 021</li>
              <li><strong>Companie:</strong> FORTITUDO VINCIT SRL</li>
            </ul>
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
