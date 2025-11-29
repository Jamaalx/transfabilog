import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import {
  HelpCircle,
  Mail,
  User,
  Truck,
  Users,
  MapPin,
  FileText,
  Upload,
  Fuel,
  CreditCard,
  Brain,
  BarChart3,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Phone,
  Globe,
  Lightbulb,
  Target,
  Milestone,
} from 'lucide-react'

export default function HelpPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <HelpCircle className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-bold">Centru de Ajutor</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Ghid complet pentru utilizarea platformei TransfaBilog
        </p>
      </div>

      {/* Quick Start Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-6 w-6 text-primary" />
            Bine ai venit la TransfaBilog!
          </CardTitle>
          <CardDescription className="text-base">
            Platforma ta completa pentru gestionarea flotei de transport
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            TransfaBilog este o solutie moderna pentru companiile de transport care doresc sa-si
            gestioneze eficient flota de vehicule, soferii, cursele si documentele. Cu ajutorul
            inteligentei artificiale, platforma automatizeaza procesele repetitive si ofera
            rapoarte detaliate pentru decizii mai bune.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
              <Target className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Simplu de folosit</p>
                <p className="text-sm text-muted-foreground">Interfata intuitiva si moderna</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
              <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium">Inteligent</p>
                <p className="text-sm text-muted-foreground">AI integrat pentru analize</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
              <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Complet</p>
                <p className="text-sm text-muted-foreground">Toate functiile intr-un singur loc</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-6 w-6 text-primary" />
            Primii Pasi - Cum sa incepi
          </CardTitle>
          <CardDescription>
            Urmeaza acesti pasi pentru a configura platforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                1
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">Adauga Vehiculele</h3>
                <p className="text-muted-foreground">
                  Mergi la <Badge variant="secondary">Vehicule</Badge> si adauga camioanele si remorcile tale.
                  Introdu numarul de inmatriculare, marca, modelul si alte detalii importante.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                2
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">Adauga Soferii</h3>
                <p className="text-muted-foreground">
                  Mergi la <Badge variant="secondary">Soferi</Badge> si inregistreaza soferii companiei.
                  Nu uita sa adaugi datele de expirare pentru permis, fisa medicala si cartela tahograf.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                3
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">Creeaza Prima Cursa</h3>
                <p className="text-muted-foreground">
                  Mergi la <Badge variant="secondary">Curse</Badge> si creeaza o noua cursa.
                  Selecteaza vehiculul, soferul, ruta si detaliile incarcaturii.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                4
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">Incarca Documentele</h3>
                <p className="text-muted-foreground">
                  Mergi la <Badge variant="secondary">Documente</Badge> pentru a incarca facturi,
                  CMR-uri, asigurari si alte documente. AI-ul le va procesa automat!
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                5
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">Importa Datele de Carburant</h3>
                <p className="text-muted-foreground">
                  Foloseste sectiunile <Badge variant="secondary">DKV</Badge>, <Badge variant="secondary">EUROWAG</Badge> sau <Badge variant="secondary">VERAG</Badge> pentru
                  a importa automat tranzactiile de carburant si taxe de drum.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Ghid Detaliat al Functiilor
          </CardTitle>
          <CardDescription>
            Click pe fiecare sectiune pentru a afla mai multe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {/* Dashboard */}
            <AccordionItem value="dashboard">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Dashboard - Panou de Control</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 text-muted-foreground">
                <p>
                  Dashboard-ul este prima pagina pe care o vezi dupa autentificare. Aici gasesti:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Statistici rapide:</strong> Numarul de vehicule active, soferi, curse in desfasurare</li>
                  <li><strong>Venituri si cheltuieli:</strong> Sumar financiar pentru luna curenta</li>
                  <li><strong>Curse recente:</strong> Lista ultimelor curse cu statusul lor</li>
                  <li><strong>Alerte:</strong> Documente care expira curand (permise, asigurari, ITP)</li>
                </ul>
                <div className="bg-blue-50 p-3 rounded-lg mt-2">
                  <p className="text-sm text-blue-800">
                    <strong>Sfat:</strong> Verifica Dashboard-ul zilnic pentru a fi la curent cu activitatea flotei!
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Vehicles */}
            <AccordionItem value="vehicles">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Vehicule - Gestionare Flota</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 text-muted-foreground">
                <p>
                  In sectiunea Vehicule poti gestiona toata flota ta:
                </p>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground">Camioane (Cap Tractor)</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Numar inmatriculare, marca, model, an fabricatie</li>
                      <li>Consum mediu de carburant</li>
                      <li>Status: activ, in service, inactiv</li>
                      <li>Date GPS (daca este disponibil)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Remorci</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Tip: prelata, frigorifica, cisterna, platforma</li>
                      <li>Capacitate (tone) si volum (m³)</li>
                      <li>Status si disponibilitate</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg mt-2">
                  <p className="text-sm text-green-800">
                    <strong>Cum adaugi un vehicul:</strong> Click pe butonul "Adauga Vehicul" → Completeaza formularul → Salveaza
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Drivers */}
            <AccordionItem value="drivers">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Soferi - Managementul Echipei</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 text-muted-foreground">
                <p>
                  Gestioneaza informatiile despre soferii tai:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Date personale:</strong> Nume, prenume, telefon, email</li>
                  <li><strong>Permis conducere:</strong> Categorie si data expirare</li>
                  <li><strong>Fisa medicala:</strong> Data expirare</li>
                  <li><strong>Cartela tahograf:</strong> Data expirare</li>
                  <li><strong>Angajare:</strong> Data angajarii, salariu, diurna</li>
                </ul>
                <div className="bg-purple-50 p-3 rounded-lg mt-2 flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-purple-800">
                    <strong>Important:</strong> Platforma te va avertiza automat cand documentele soferilor sunt pe cale sa expire!
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Trips */}
            <AccordionItem value="trips">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-red-600" />
                  <span className="font-medium">Curse - Planificare si Monitorizare</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 text-muted-foreground">
                <p>
                  Planifica si monitorizeaza toate cursele:
                </p>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground">Crearea unei curse noi:</h4>
                    <ol className="list-decimal list-inside space-y-1 ml-4">
                      <li>Selecteaza vehiculul (camion + remorca)</li>
                      <li>Alege soferul</li>
                      <li>Introdu punctul de plecare si destinatia</li>
                      <li>Adauga detalii despre marfa (tip, greutate)</li>
                      <li>Introdu informatiile clientului</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Statusuri curse:</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="bg-yellow-50">Planificata</Badge>
                      <Badge variant="outline" className="bg-blue-50">In desfasurare</Badge>
                      <Badge variant="outline" className="bg-green-50">Finalizata</Badge>
                      <Badge variant="outline" className="bg-red-50">Anulata</Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Cheltuieli cursa:</h4>
                    <p>Poti adauga cheltuieli pentru: carburant, taxe drum, parcare, mancare, reparatii, asigurari</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Documents */}
            <AccordionItem value="documents">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Upload className="h-5 w-5 text-orange-600" />
                  <span className="font-medium">Documente - Incarcare si Procesare AI</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 text-muted-foreground">
                <p>
                  Incarca documente care vor fi procesate automat de AI:
                </p>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground">Tipuri de documente acceptate:</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Facturi (primite si emise)</li>
                      <li>Extrase bancare</li>
                      <li>Chitante si bonuri</li>
                      <li>CMR-uri</li>
                      <li>Asigurari, ITP, Certificate</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Formate acceptate:</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge>PDF</Badge>
                      <Badge>Excel (.xlsx, .xls)</Badge>
                      <Badge>Word (.docx)</Badge>
                      <Badge>Imagini</Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Cum functioneaza:</h4>
                    <ol className="list-decimal list-inside space-y-1 ml-4">
                      <li>Incarca documentul</li>
                      <li>AI-ul analizeaza si extrage datele</li>
                      <li>Verifica si corecteaza daca e nevoie</li>
                      <li>Confirma pentru a salva in sistem</li>
                    </ol>
                  </div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg mt-2">
                  <p className="text-sm text-orange-800">
                    <strong>Sfat:</strong> Cu cat documentele sunt mai clare, cu atat AI-ul le proceseaza mai precis!
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Fuel Cards */}
            <AccordionItem value="fuelcards">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Fuel className="h-5 w-5 text-cyan-600" />
                  <span className="font-medium">Carduri Carburant - DKV, EUROWAG, VERAG</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 text-muted-foreground">
                <p>
                  Importa automat tranzactiile de la furnizorii de carduri de carburant:
                </p>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground">Furnizori suportati:</h4>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div className="p-3 bg-gray-50 rounded-lg text-center">
                        <Fuel className="h-8 w-8 mx-auto text-red-600 mb-2" />
                        <p className="font-medium">DKV</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg text-center">
                        <CreditCard className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                        <p className="font-medium">EUROWAG</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg text-center">
                        <Milestone className="h-8 w-8 mx-auto text-green-600 mb-2" />
                        <p className="font-medium">VERAG</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Procesul de import:</h4>
                    <ol className="list-decimal list-inside space-y-1 ml-4">
                      <li>Descarca raportul Excel de la furnizor</li>
                      <li>Incarca fisierul in sectiunea corespunzatoare</li>
                      <li>Sistemul parseaza automat tranzactiile</li>
                      <li>Asociaza tranzactiile cu vehiculele (automat sau manual)</li>
                      <li>Verifica si aproba pentru a le transfera in sistem</li>
                    </ol>
                  </div>
                </div>
                <div className="bg-cyan-50 p-3 rounded-lg mt-2">
                  <p className="text-sm text-cyan-800">
                    <strong>Nota:</strong> Cursurile de schimb valutar sunt preluate automat de la BNR!
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Reports */}
            <AccordionItem value="reports">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  <span className="font-medium">Rapoarte - Analize si Statistici</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 text-muted-foreground">
                <p>
                  Genereaza rapoarte detaliate pentru a intelege mai bine afacerea:
                </p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Tipuri de rapoarte disponibile:</h4>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Raport Financiar:</strong> Venituri, cheltuieli, profit pe perioada selectata</li>
                    <li><strong>Raport Profitabilitate:</strong> Analiza per cursa, per sofer, per vehicul</li>
                    <li><strong>Raport Curse:</strong> Distante parcurse, durate, incasari</li>
                    <li><strong>Raport Flota:</strong> Utilizarea vehiculelor, costuri de intretinere</li>
                    <li><strong>Raport Cheltuieli:</strong> Detaliere pe categorii cu grafice</li>
                    <li><strong>Raport Documente:</strong> Status documente, expirari</li>
                  </ul>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg mt-2">
                  <p className="text-sm text-indigo-800">
                    <strong>Sfat:</strong> Foloseste filtrele de data pentru a compara perioade diferite!
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* AI Analytics */}
            <AccordionItem value="ai">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Brain className="h-5 w-5 text-pink-600" />
                  <span className="font-medium">AI Analytics - Inteligenta Artificiala</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 text-muted-foreground">
                <p>
                  Foloseste puterea AI pentru analize avansate:
                </p>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground">Functionalitati AI:</h4>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>Analiza Generala:</strong> Sumar executiv al afacerii</li>
                      <li><strong>Recomandari:</strong> Sugestii concrete pentru imbunatatiri</li>
                      <li><strong>Alerte de Risc:</strong> Identificarea problemelor potentiale</li>
                      <li><strong>Optimizari:</strong> Oportunitati de reducere a costurilor</li>
                      <li><strong>Chat AI:</strong> Intreaba orice despre datele tale!</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-pink-50 p-3 rounded-lg mt-2">
                  <p className="text-sm text-pink-800">
                    <strong>Exemplu intrebare:</strong> "Care este cel mai profitabil sofer din ultimele 3 luni?"
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            Intrebari Frecvente (FAQ)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="faq1">
              <AccordionTrigger>Cum pot adauga mai multi utilizatori?</AccordionTrigger>
              <AccordionContent>
                Contacteaza administratorul platformei pentru a adauga utilizatori noi.
                Fiecare utilizator poate avea un rol diferit: admin, manager, operator sau vizualizator.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq2">
              <AccordionTrigger>Datele mele sunt in siguranta?</AccordionTrigger>
              <AccordionContent>
                Da! Folosim cele mai bune practici de securitate: criptare SSL, autentificare
                securizata prin Supabase, si izolare completa a datelor intre companii.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq3">
              <AccordionTrigger>Pot exporta datele mele?</AccordionTrigger>
              <AccordionContent>
                Da, rapoartele pot fi exportate. Datele tale iti apartin si poti solicita
                oricand un export complet contactand suportul.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq4">
              <AccordionTrigger>Ce fac daca am o eroare?</AccordionTrigger>
              <AccordionContent>
                Daca intampini probleme, incearca sa reimprospatezi pagina (F5).
                Daca problema persista, contacteaza suportul cu detalii despre eroare.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq5">
              <AccordionTrigger>Pot folosi aplicatia pe telefon?</AccordionTrigger>
              <AccordionContent>
                Da! Interfata este responsiva si functioneaza pe telefoane si tablete.
                Deschide site-ul in browserul telefonului pentru acces mobil.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact Section */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-primary/10">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Mail className="h-7 w-7 text-primary" />
            Ai nevoie de ajutor suplimentar?
          </CardTitle>
          <CardDescription className="text-base">
            Suntem aici sa te ajutam cu orice nelamurire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Alex Mantello</p>
                  <p className="text-sm text-muted-foreground">Suport & Dezvoltare</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <a
                href="mailto:alex@zed-zen.com"
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-md"
              >
                <Mail className="h-5 w-5" />
                alex@zed-zen.com
              </a>
            </div>

            <div className="text-center text-sm text-muted-foreground mt-4 p-4 bg-white/50 rounded-lg max-w-md">
              <p>
                Nu ezita sa ma contactezi pentru:
              </p>
              <ul className="mt-2 space-y-1">
                <li>• Intrebari despre functionalitatile platformei</li>
                <li>• Asistenta tehnica</li>
                <li>• Sugestii de imbunatatire</li>
                <li>• Raportare erori sau probleme</li>
                <li>• Solicitari de functionalitati noi</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Version Info */}
      <div className="text-center text-sm text-muted-foreground pb-4">
        <p>TransfaBilog v1.0 - Platforma de Management Transport</p>
        <p>© 2024 Zed-Zen. Toate drepturile rezervate.</p>
      </div>
    </div>
  )
}
