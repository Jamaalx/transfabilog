import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
  ArrowRight,
  CheckCircle2,
  Brain,
  Fuel,
  FileText,
  Truck,
  BarChart3,
  ShieldCheck,
  Zap,
  CreditCard,
  Globe
} from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.webp" alt="Floteris" className="h-8 w-8" />
            <span className="text-xl font-bold text-slate-900">Floteris</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Autentificare
            </Button>
            <Button onClick={() => navigate('/login')}>
              Începe Gratuit
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Style similar to VoiceOS header */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1 text-blue-700 bg-blue-100 hover:bg-blue-200 border-blue-200">
            ✨ Nou: Analiză documente cu AI v2.0
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 max-w-4xl mx-auto">
            Management de Flotă <br />
            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
              Simplificat de AI
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Scapă de excel-uri și dosare. Floteris centralizează vehiculele, șoferii,
            consumul de carburant și documentele într-o singură platformă inteligentă.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/login')} className="h-12 px-8 text-lg shadow-lg shadow-blue-500/20">
              Încearcă Platforma
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
              Vezi Demo
            </Button>
          </div>

          {/* Hero Image / Abstract Representation */}
          <div className="mt-20 relative mx-auto max-w-5xl">
            <div className="aspect-video rounded-2xl bg-slate-900 shadow-2xl border border-slate-800 flex items-center justify-center overflow-hidden group p-2">
               {/* Mock Interface UI */}
               <div className="w-full h-full bg-slate-950 rounded-xl overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-12 border-b border-slate-800 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="mt-16 px-8 grid grid-cols-3 gap-6">
                     <div className="col-span-2 space-y-4">
                        <div className="h-32 bg-slate-800/50 rounded-lg animate-pulse"></div>
                        <div className="h-64 bg-slate-800/50 rounded-lg"></div>
                     </div>
                     <div className="col-span-1 space-y-4">
                        <div className="h-20 bg-blue-500/10 border border-blue-500/20 rounded-lg"></div>
                        <div className="h-20 bg-slate-800/50 rounded-lg"></div>
                        <div className="h-full bg-slate-800/50 rounded-lg"></div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Similar to VoiceOS "AI Voice Typing" sections */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Funcționalități Esențiale</h2>
            <p className="text-slate-500 text-lg">Tot ce ai nevoie pentru o logistică fără dureri de cap.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-none shadow-lg bg-slate-50/50">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Procesare Documente AI</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-6">
                  Încarcă facturi, CMR-uri sau RCA-uri. AI-ul extrage automat datele,
                  le validează și le asociază cu vehiculele sau cursele corecte.
                </p>
                <div className="bg-white p-4 rounded-lg border text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-500">Factura #9921</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">Validat</Badge>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full w-full mb-2">
                    <div className="h-2 bg-blue-500 rounded-full w-[99%]"></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Acuratețe</span>
                    <span>99%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-none shadow-lg bg-slate-50/50">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                  <Fuel className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Import Carburant & Taxe</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-6">
                  Importă automat rapoartele de la DKV, Eurowag sau Verag.
                  Sistemul detectează dublurile și calculează costul pe km.
                </p>
                <div className="grid grid-cols-2 gap-2">
                   <div className="p-3 bg-white border rounded flex items-center justify-center font-bold text-slate-700">DKV</div>
                   <div className="p-3 bg-white border rounded flex items-center justify-center font-bold text-blue-700">EUROWAG</div>
                   <div className="p-3 bg-white border rounded flex items-center justify-center font-bold text-green-700">VERAG</div>
                   <div className="p-3 bg-white border rounded flex items-center justify-center font-bold text-yellow-600">SHELL</div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-none shadow-lg bg-slate-50/50">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Analiză Profitabilitate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-6">
                  Vezi în timp real profitul per camion, șofer sau cursă.
                  Identifică rutele neprofitabile înainte să devină o problemă.
                </p>
                <div className="flex items-end gap-2 h-24 px-4 pb-2 bg-white border rounded-lg">
                   <div className="w-1/4 bg-slate-200 rounded-t h-[40%]"></div>
                   <div className="w-1/4 bg-slate-200 rounded-t h-[60%]"></div>
                   <div className="w-1/4 bg-slate-200 rounded-t h-[30%]"></div>
                   <div className="w-1/4 bg-green-500 rounded-t h-[85%]"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Integrations / What you can track - Similar to VoiceOS Icon grid */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Centralizează Totul</h2>
            <p className="text-slate-500">O singură platformă pentru toate aspectele operaționale.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Truck, label: 'Management Flotă' },
              { icon: FileText, label: 'Alerte Documente' },
              { icon: ShieldCheck, label: 'Asigurări & ITP' },
              { icon: Zap, label: 'Costuri Mentenanță' },
              { icon: CreditCard, label: 'Extrase Bancare' },
              { icon: Globe, label: 'Rute & Curse' },
              { icon: Brain, label: 'Chat cu Datele (AI)' },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <item.icon className="h-8 w-8 text-slate-700 mb-3" />
                <span className="font-medium text-slate-900">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Similar to VoiceOS Pricing */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Prețuri Transparente</h2>
            <p className="text-slate-500 text-lg">Alege planul potrivit pentru dimensiunea flotei tale.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free / Starter */}
            <div className="p-8 rounded-2xl border bg-white flex flex-col">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-slate-900">Starter</h3>
                <div className="mt-2 flex items-baseline">
                  <span className="text-4xl font-bold tracking-tight text-slate-900">€0</span>
                  <span className="ml-1 text-sm font-semibold text-slate-500">/lună</span>
                </div>
                <p className="mt-4 text-sm text-slate-500">Perfect pentru 1-2 camioane.</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {['Până la 2 vehicule', 'Management documente de bază', 'Alerte expirare', 'Suport Email'].map((feat) => (
                  <li key={feat} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mr-2 shrink-0" />
                    <span className="text-sm text-slate-600">{feat}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full">Începe Gratuit</Button>
            </div>

            {/* Pro */}
            <div className="p-8 rounded-2xl border-2 border-blue-600 bg-white flex flex-col relative shadow-xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Cel mai popular
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-slate-900">Pro</h3>
                <div className="mt-2 flex items-baseline">
                  <span className="text-4xl font-bold tracking-tight text-slate-900">€12</span>
                  <span className="ml-1 text-sm font-semibold text-slate-500">/vehicul/lună</span>
                </div>
                <p className="mt-4 text-sm text-slate-500">Pentru flote în creștere.</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'Vehicule nelimitate',
                  'AI Document Processing',
                  'Import DKV / Eurowag',
                  'Rapoarte Profitabilitate',
                  'Chat cu AI Assistant',
                  'Suport Prioritar'
                ].map((feat) => (
                  <li key={feat} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mr-2 shrink-0" />
                    <span className="text-sm text-slate-600">{feat}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Încearcă Pro</Button>
            </div>

            {/* Enterprise */}
            <div className="p-8 rounded-2xl border bg-slate-50 flex flex-col">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-slate-900">Enterprise</h3>
                <div className="mt-2 flex items-baseline">
                  <span className="text-4xl font-bold tracking-tight text-slate-900">Custom</span>
                </div>
                <p className="mt-4 text-sm text-slate-500">Pentru flote mari (+50 camioane).</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'Tot ce include Pro',
                  'API Access',
                  'Integrări Custom (ERP)',
                  'Onboarding Dedicat',
                  'Contract SLA',
                  'White-labeling'
                ].map((feat) => (
                  <li key={feat} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-slate-600 mr-2 shrink-0" />
                    <span className="text-sm text-slate-600">{feat}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full">Contactează Vânzări</Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ - Using existing Accordion component */}
      <section className="py-24 bg-white border-t">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Întrebări Frecvente</h2>
            <p className="text-slate-500">Tot ce trebuie să știi despre Floteris.</p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Cum funcționează citirea automată a documentelor?</AccordionTrigger>
              <AccordionContent>
                Folosim modele avansate de AI (Vision) pentru a scana facturile și documentele încărcate.
                Sistemul identifică automat furnizorul, data, sumele și numerele de înmatriculare, eliminând necesitatea introducerii manuale a datelor.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Pot importa date de la DKV sau Eurowag?</AccordionTrigger>
              <AccordionContent>
                Da, Floteris are integrări native pentru importul fișierelor Excel/CSV de la majoritatea furnizorilor de carduri de carburant, inclusiv DKV, Eurowag, Verag și Shell.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Datele mele sunt în siguranță?</AccordionTrigger>
              <AccordionContent>
                Absolut. Folosim criptare SSL pentru toate transferurile de date și stocăm documentele în cloud securizat. Bazele de date sunt izolate, iar backup-urile se fac zilnic.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Pot gestiona și șoferii?</AccordionTrigger>
              <AccordionContent>
                Da, poți ține evidența șoferilor, a permiselor, fișelor medicale și atestatelor. Sistemul trimite alerte automate înainte ca documentele să expire.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <img src="/logo-full.webp" alt="Floteris" className="h-8 brightness-0 invert" />
            </div>
            <div className="text-sm">
              © 2024 Floteris. Toate drepturile rezervate.
            </div>
            <div className="flex gap-6 mt-4 md:mt-0 text-sm">
              <a href="#" className="hover:text-white transition-colors">Termeni</a>
              <a href="#" className="hover:text-white transition-colors">Confidențialitate</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}