import { Link } from 'react-router-dom'
import { ArrowLeft, Shield, Lock, Eye, Trash2, Download, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function GDPRPage() {
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
        <h1 className="text-3xl md:text-4xl font-bold mb-4">GDPR - Protecția Datelor</h1>
        <p className="text-lg text-slate-600 mb-8">
          Suntem dedicați protejării datelor dumneavoastră personale în conformitate cu
          Regulamentul General privind Protecția Datelor (GDPR).
        </p>

        {/* Rights Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="border-2 hover:border-blue-200 transition-colors">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Dreptul la Acces</h3>
              <p className="text-slate-600 text-sm">
                Aveți dreptul să solicitați o copie a tuturor datelor personale pe care le deținem despre dumneavoastră.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-green-200 transition-colors">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Edit className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Dreptul la Rectificare</h3>
              <p className="text-slate-600 text-sm">
                Puteți solicita corectarea datelor inexacte sau completarea datelor incomplete.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-red-200 transition-colors">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Dreptul la Ștergere</h3>
              <p className="text-slate-600 text-sm">
                Puteți solicita ștergerea datelor personale în anumite circumstanțe ("dreptul de a fi uitat").
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-purple-200 transition-colors">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Download className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Dreptul la Portabilitate</h3>
              <p className="text-slate-600 text-sm">
                Puteți primi datele dumneavoastră într-un format structurat și transferabil.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Angajamentul Nostru GDPR</h2>
            <p className="text-slate-600 mb-4">
              FORTITUDO VINCIT SRL, în calitate de operator de date, se angajează să respecte toate
              cerințele Regulamentului (UE) 2016/679 (GDPR). Acest angajament include:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Colectarea doar a datelor necesare pentru furnizarea serviciului</li>
              <li>Prelucrarea datelor în mod legal, echitabil și transparent</li>
              <li>Păstrarea datelor doar cât este necesar</li>
              <li>Asigurarea securității și confidențialității datelor</li>
              <li>Respectarea drepturilor persoanelor vizate</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Operator de Date</h2>
            <div className="bg-slate-50 p-6 rounded-xl">
              <p className="text-slate-600 mb-2"><strong>Companie:</strong> FORTITUDO VINCIT SRL</p>
              <p className="text-slate-600 mb-2"><strong>Adresă:</strong> București, România</p>
              <p className="text-slate-600 mb-2"><strong>Email:</strong> contact@zed-zen.com</p>
              <p className="text-slate-600"><strong>Telefon:</strong> +40 757 314 021</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Transferuri Internaționale</h2>
            <p className="text-slate-600">
              Datele dumneavoastră sunt stocate și procesate exclusiv în cadrul Uniunii Europene.
              Nu transferăm date personale în afara UE/SEE fără garanții adecvate și fără a vă informa în prealabil.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Măsuri de Securitate</h2>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
                <span className="text-sm text-slate-700">Criptare SSL/TLS</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Lock className="h-6 w-6 text-blue-600" />
                <span className="text-sm text-slate-700">AES-256 stocare</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
                <span className="text-sm text-slate-700">Backup zilnic</span>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Cum Vă Exercitați Drepturile</h2>
            <p className="text-slate-600 mb-4">
              Pentru a vă exercita oricare dintre drepturile GDPR, puteți:
            </p>
            <ol className="list-decimal pl-6 text-slate-600 space-y-2">
              <li>Trimiteți un email la <strong>contact@zed-zen.com</strong> cu subiectul "Cerere GDPR"</li>
              <li>Specificați care este dreptul pe care doriți să îl exercitați</li>
              <li>Vom răspunde în termen de 30 de zile de la primirea cererii</li>
              <li>Este posibil să vă solicităm verificarea identității</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Plângeri</h2>
            <p className="text-slate-600 mb-4">
              Dacă nu sunteți mulțumit de modul în care vă gestionăm datele, aveți dreptul să depuneți
              o plângere la autoritatea de supraveghere:
            </p>
            <div className="bg-slate-50 p-6 rounded-xl">
              <p className="text-slate-700 font-medium mb-2">
                Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)
              </p>
              <p className="text-slate-600 text-sm">
                B-dul G-ral. Gheorghe Magheru 28-30, Sector 1, București<br />
                Telefon: +40 31 805 9211<br />
                Email: anspdcp@dataprotection.ro<br />
                Website: www.dataprotection.ro
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Actualizări</h2>
            <p className="text-slate-600">
              Această pagină poate fi actualizată periodic pentru a reflecta schimbări în practicile noastre
              sau în legislație. Ultima actualizare: 1 Decembrie 2025.
            </p>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-12 p-8 bg-blue-50 rounded-2xl text-center">
          <h3 className="text-xl font-semibold mb-2">Aveți întrebări despre datele dumneavoastră?</h3>
          <p className="text-slate-600 mb-4">
            Echipa noastră vă stă la dispoziție pentru orice clarificări.
          </p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <a href="mailto:contact@zed-zen.com?subject=Cerere%20GDPR">
              Contactează-ne
            </a>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          © 2025 FORTITUDO VINCIT SRL. Toate drepturile rezervate.
        </div>
      </footer>
    </div>
  )
}
