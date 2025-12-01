import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
  ArrowRight,
  CheckCircle2,
  Brain,
  Fuel,
  BarChart3,
  ShieldCheck,
  Zap,
  Users,
  TrendingUp,
  Shield,
  Award,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Calculator,
  Timer,
  Target,
  Lock,
  Server,
  Building2
} from 'lucide-react'

// Animated counter hook
function useCountUp(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!startOnView) {
      setHasStarted(true)
    }
  }, [startOnView])

  useEffect(() => {
    if (startOnView && ref.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true)
          }
        },
        { threshold: 0.1 }
      )
      observer.observe(ref.current)
      return () => observer.disconnect()
    }
  }, [startOnView, hasStarted])

  useEffect(() => {
    if (!hasStarted) return

    let startTime: number
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }
    requestAnimationFrame(step)
  }, [end, duration, hasStarted])

  return { count, ref }
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [vehicleCount, setVehicleCount] = useState(10)
  const [hoursPerWeek, setHoursPerWeek] = useState(5)

  // Stats counters
  const stat1 = useCountUp(127, 2000)
  const stat2 = useCountUp(2847, 2000)
  const stat3 = useCountUp(98, 2000)
  const stat4 = useCountUp(4200000, 2500)

  // ROI Calculator
  const hourlyRate = 25 // EUR per hour
  const monthlyHoursSaved = hoursPerWeek * 4
  const yearlySavings = monthlyHoursSaved * 12 * hourlyRate
  const platformCost = vehicleCount * 12 * 12 // €12/vehicle/month for 12 months
  const netSavings = yearlySavings - platformCost
  const roi = platformCost > 0 ? Math.round((netSavings / platformCost) * 100) : 0

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.webp" alt="Floteris" className="h-8 w-8" />
            <span className="text-xl font-bold text-slate-900">Floteris</span>
          </div>
          <div className="hidden lg:flex items-center gap-8">
            <button onClick={() => scrollToSection('features')} className="text-sm text-slate-600 hover:text-blue-600 transition-colors font-medium">
              Funcționalități
            </button>
            <button onClick={() => scrollToSection('roi')} className="text-sm text-slate-600 hover:text-blue-600 transition-colors font-medium">
              Calculator ROI
            </button>
            <button onClick={() => scrollToSection('pricing')} className="text-sm text-slate-600 hover:text-blue-600 transition-colors font-medium">
              Prețuri
            </button>
            <button onClick={() => scrollToSection('testimonials')} className="text-sm text-slate-600 hover:text-blue-600 transition-colors font-medium">
              Clienți
            </button>
            <button onClick={() => scrollToSection('faq')} className="text-sm text-slate-600 hover:text-blue-600 transition-colors font-medium">
              FAQ
            </button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/login')} className="hidden sm:inline-flex">
              Autentificare
            </Button>
            <Button onClick={() => scrollToSection('demo')} className="bg-blue-600 hover:bg-blue-700">
              Solicită Demo
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - B2B Focused */}
      <section className="relative pt-16 pb-24 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <Badge className="mb-6 px-4 py-2 bg-blue-500/20 text-blue-300 border-blue-400/30 hover:bg-blue-500/30">
                <Zap className="w-3 h-3 mr-1" />
                Platforma #1 pentru flote din România
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
                Reduceți costurile flotei cu{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  până la 30%
                </span>
              </h1>

              <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-xl">
                Automatizați procesarea documentelor, importul de carburant și rapoartele de profitabilitate.
                Soluția preferată de companiile de transport din România.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  size="lg"
                  onClick={() => scrollToSection('demo')}
                  className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
                >
                  Solicită Demo Gratuit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollToSection('roi')}
                  className="h-14 px-8 text-lg border-slate-500 text-white hover:bg-white/10"
                >
                  <Calculator className="mr-2 h-5 w-5" />
                  Calculează ROI
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Setup în 24h</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Fără contract minim</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>GDPR Compliant</span>
                </div>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="relative hidden lg:block">
              <div className="relative bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
                <div className="h-10 border-b border-slate-700 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="p-6 space-y-4">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                      <div className="text-xs text-slate-400 mb-1">Vehicule Active</div>
                      <div className="text-2xl font-bold text-white">47</div>
                      <div className="text-xs text-green-400 mt-1">+3 luna aceasta</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                      <div className="text-xs text-slate-400 mb-1">Cost/km Mediu</div>
                      <div className="text-2xl font-bold text-white">€0.42</div>
                      <div className="text-xs text-green-400 mt-1">-8% vs. luna trecută</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                      <div className="text-xs text-slate-400 mb-1">Documente Procesate</div>
                      <div className="text-2xl font-bold text-white">1,247</div>
                      <div className="text-xs text-blue-400 mt-1">99.2% acuratețe</div>
                    </div>
                  </div>
                  {/* Chart Placeholder */}
                  <div className="bg-slate-700/30 rounded-lg p-4 h-48 flex items-end gap-2">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Floating notification */}
              <div className="absolute -right-4 top-20 bg-white rounded-lg shadow-xl p-4 border animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">Document procesat</div>
                    <div className="text-xs text-slate-500">Factura DKV - 2.3s</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Partners */}
      <section className="py-12 bg-slate-50 border-b">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-slate-500 mb-8 font-medium">
            INTEGRĂRI DISPONIBILE CU PRINCIPALII FURNIZORI
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {[
              { name: 'DKV', color: 'text-slate-700' },
              { name: 'Eurowag', color: 'text-blue-600' },
              { name: 'Verag', color: 'text-green-600' },
              { name: 'Shell', color: 'text-yellow-600' },
              { name: 'OMV', color: 'text-blue-800' },
              { name: 'Petrom', color: 'text-red-600' }
            ].map((partner, idx) => (
              <div key={idx} className="flex items-center gap-2 px-6 py-3 bg-white rounded-lg border shadow-sm">
                <Fuel className="h-5 w-5 text-slate-400" />
                <span className={`text-lg font-bold ${partner.color}`}>{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center" ref={stat1.ref}>
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">99%</div>
              <div className="text-slate-600 font-medium">Acuratețe AI Documente</div>
            </div>
            <div className="text-center" ref={stat2.ref}>
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">2.3s</div>
              <div className="text-slate-600 font-medium">Timp Mediu Procesare</div>
            </div>
            <div className="text-center" ref={stat3.ref}>
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-slate-600 font-medium">Disponibilitate Platformă</div>
            </div>
            <div className="text-center" ref={stat4.ref}>
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">GDPR</div>
              <div className="text-slate-600 font-medium">Date Securizate în UE</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Funcționalități</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tot ce aveți nevoie într-o singură platformă</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              De la procesarea automată a documentelor la rapoarte de profitabilitate în timp real.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 - AI */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white group">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Brain className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Procesare AI Documente</h3>
                <p className="text-slate-600 mb-6">
                  Încărcați facturi, CMR-uri sau polițe. AI-ul extrage datele în secunde cu 99% acuratețe.
                </p>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-600">Timp procesare</span>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">~2.3 secunde</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Reducere erori</span>
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">-95%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 2 - Fuel */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white group">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Fuel className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Import Automat Carburant</h3>
                <p className="text-slate-600 mb-6">
                  Import direct din DKV, Eurowag, Verag și Shell. Detectare automată dubluri și calcul cost/km.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-slate-50 rounded-lg text-center font-bold text-slate-700">DKV</div>
                  <div className="p-3 bg-slate-50 rounded-lg text-center font-bold text-blue-700">EUROWAG</div>
                  <div className="p-3 bg-slate-50 rounded-lg text-center font-bold text-green-700">VERAG</div>
                  <div className="p-3 bg-slate-50 rounded-lg text-center font-bold text-yellow-600">SHELL</div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3 - Analytics */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white group">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Analiză Profitabilitate</h3>
                <p className="text-slate-600 mb-6">
                  Profit per vehicul, șofer sau rută. Identificați pierderile înainte să devină probleme.
                </p>
                <div className="flex items-end gap-1 h-20 p-2 bg-slate-50 rounded-xl">
                  {[35, 50, 40, 65, 45, 80, 55, 75].map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-t transition-all duration-500 ${i === 5 ? 'bg-green-500' : 'bg-slate-300'}`}
                      style={{ height: `${h}%` }}
                    ></div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Feature 4 - Alerts */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white group">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Alerte Documente</h3>
                <p className="text-slate-600 mb-6">
                  Notificări automate pentru ITP, RCA, licențe și atestate. Evitați amenzile și întârzierile.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-100">
                    <span className="text-sm text-red-700">ITP B-123-ABC</span>
                    <span className="text-xs text-red-500">Expiră în 3 zile</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg border border-yellow-100">
                    <span className="text-sm text-yellow-700">RCA CT-456-DEF</span>
                    <span className="text-xs text-yellow-600">Expiră în 12 zile</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 5 - Drivers */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white group">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Gestiune Șoferi</h3>
                <p className="text-slate-600 mb-6">
                  Evidență completă: permise, fișe medicale, atestate, diurnă și performanță.
                </p>
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 border-2 border-white flex items-center justify-center"
                    >
                      <Users className="h-4 w-4 text-slate-500" />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-bold text-blue-600">
                    +47
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 6 - AI Chat */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white group">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">AI Assistant</h3>
                <p className="text-slate-600 mb-6">
                  Întrebați datele în limbaj natural: "Care camion a consumat cel mai mult luna trecută?"
                </p>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                      <Brain className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-sm text-slate-600">
                      "Camionul B-789-XYZ a avut cel mai mare consum: 34.2L/100km..."
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section id="roi" className="py-24 bg-gradient-to-br from-blue-900 via-slate-900 to-slate-800 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-400/30">Calculator ROI</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Calculați Economiile cu Floteris
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Vedeți cât puteți economisi eliminând munca manuală și optimizând operațiunile.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Inputs */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-6">Parametri Flotă</h3>

                <div className="space-y-6">
                  <div>
                    <label className="text-slate-300 mb-3 block text-sm font-medium">
                      Număr vehicule: <span className="text-white font-bold">{vehicleCount}</span>
                    </label>
                    <input
                      type="range"
                      value={vehicleCount}
                      onChange={(e) => setVehicleCount(Number(e.target.value))}
                      min={1}
                      max={100}
                      step={1}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>1</span>
                      <span>100</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 mb-3 block text-sm font-medium">
                      Ore/săptămână pe administrare manuală: <span className="text-white font-bold">{hoursPerWeek}h</span>
                    </label>
                    <input
                      type="range"
                      value={hoursPerWeek}
                      onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                      min={1}
                      max={40}
                      step={1}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>1h</span>
                      <span>40h</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
                      <span>Cost oră muncă estimat:</span>
                      <span className="text-white">€{hourlyRate}/oră</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-400">
                      <span>Ore economsite/lună:</span>
                      <span className="text-white">{monthlyHoursSaved} ore</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 shadow-xl">
                <h3 className="text-lg font-semibold text-white mb-6">Economii Estimate Anual</h3>

                <div className="space-y-4">
                  <div className="bg-white/20 rounded-xl p-4">
                    <div className="text-blue-200 text-sm mb-1">Valoare timp economisit</div>
                    <div className="text-3xl font-bold text-white">€{yearlySavings.toLocaleString()}</div>
                  </div>

                  <div className="bg-white/20 rounded-xl p-4">
                    <div className="text-blue-200 text-sm mb-1">Cost platformă Floteris</div>
                    <div className="text-2xl font-bold text-white">-€{platformCost.toLocaleString()}</div>
                  </div>

                  <div className="bg-white rounded-xl p-4">
                    <div className="text-blue-600 text-sm mb-1">Economie netă anuală</div>
                    <div className="text-4xl font-bold text-blue-700">€{netSavings.toLocaleString()}</div>
                  </div>

                  <div className="text-center pt-4">
                    <div className="text-blue-200 text-sm mb-1">Return on Investment</div>
                    <div className="text-5xl font-bold text-white">{roi > 0 ? '+' : ''}{roi}%</div>
                  </div>
                </div>

                <Button
                  className="w-full mt-6 h-12 bg-white text-blue-700 hover:bg-blue-50 font-semibold"
                  onClick={() => scrollToSection('demo')}
                >
                  Solicită Demo Personalizat
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Example Scenario Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <Badge variant="outline" className="mb-4">Scenariu Exemplu</Badge>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  Cum ar arăta economiile pentru o flotă de 30-40 camioane
                </h2>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  O companie cu flotă medie care procesează manual documente și reconciliază
                  facturile de carburant pierde în medie 15-20 ore/săptămână. Iată ce poate obține:
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                      <Timer className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">~16 ore economiste/săptămână</div>
                      <div className="text-sm text-slate-500">Procesare automată documente</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">€15,000 - €25,000/an potential</div>
                      <div className="text-sm text-slate-500">Economii costuri administrative</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                      <Target className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Evitarea amenzilor</div>
                      <div className="text-sm text-slate-500">Alerte automate pentru documente</div>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="gap-2" onClick={() => scrollToSection('roi')}>
                  Calculează pentru flota ta
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="bg-slate-100 rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-xl">Flotă Exemplu</div>
                    <div className="text-slate-500">Transport Internațional</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white rounded-xl">
                    <span className="text-slate-600">Vehicule</span>
                    <span className="font-bold text-slate-900">35</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white rounded-xl">
                    <span className="text-slate-600">Șoferi</span>
                    <span className="font-bold text-slate-900">~45</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white rounded-xl">
                    <span className="text-slate-600">Documente/lună</span>
                    <span className="font-bold text-slate-900">~400</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl border border-green-200">
                    <span className="text-green-700 font-medium">ROI estimat în primul an</span>
                    <span className="font-bold text-green-700">+200-400%</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-4 text-center">
                  * Estimări bazate pe eficiența medie a automatizării
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-slate-50 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Prețuri</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Prețuri Transparente, Fără Surprize</h2>
            <p className="text-slate-500 text-lg">
              Fără contracte pe termen lung. Fără costuri ascunse. Anulați oricând.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter */}
            <Card className="relative border-2 hover:border-slate-300 transition-colors">
              <CardContent className="p-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Starter</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold">€0</span>
                  <span className="ml-2 text-slate-500">/lună</span>
                </div>
                <p className="text-slate-500 mb-6">Perfect pentru flote mici, 1-2 vehicule.</p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Până la 2 vehicule',
                    'Management documente',
                    'Alerte expirare',
                    'Suport email',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                      <span className="text-slate-600">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
                  Începe Gratuit
                </Button>
              </CardContent>
            </Card>

            {/* Pro - Featured */}
            <Card className="relative border-2 border-blue-600 shadow-xl scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-blue-600 hover:bg-blue-600 text-white px-4 py-1">
                  Cel mai popular
                </Badge>
              </div>
              <CardContent className="p-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Professional</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold">€12</span>
                  <span className="ml-2 text-slate-500">/vehicul/lună</span>
                </div>
                <p className="text-slate-500 mb-6">Pentru flote în creștere care vor eficiență.</p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Vehicule nelimitate',
                    'AI Document Processing',
                    'Import DKV / Eurowag / Verag',
                    'Rapoarte profitabilitate',
                    'AI Assistant Chat',
                    'Suport prioritar 24/7',
                    'Export date nelimitat',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
                      <span className="text-slate-600">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/login')}>
                  Încearcă 14 Zile Gratuit
                </Button>
                <p className="text-center text-xs text-slate-500 mt-3">Nu necesită card de credit</p>
              </CardContent>
            </Card>

            {/* Enterprise */}
            <Card className="relative border-2 hover:border-slate-300 transition-colors bg-slate-900 text-white">
              <CardContent className="p-8">
                <h3 className="text-lg font-semibold mb-2">Enterprise</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
                <p className="text-slate-400 mb-6">Pentru flote mari cu nevoi specifice.</p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Tot ce include Pro',
                    'API Access complet',
                    'Integrări ERP custom',
                    'Onboarding dedicat',
                    'SLA garantat 99.9%',
                    'Account manager dedicat',
                    'White-labeling disponibil',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0" />
                      <span className="text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-slate-900">
                  Contactează Vânzări
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits / Results You Can Achieve */}
      <section id="testimonials" className="py-24 bg-white scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Rezultate</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ce Poți Obține cu Floteris</h2>
            <p className="text-slate-500 text-lg">
              Rezultate bazate pe eficiența automatizării și eliminarea muncii manuale
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Timer,
                title: 'Timp Economisit',
                metric: '80%',
                metricLabel: 'reducere timp procesare',
                description: 'Documentele care durau ore să fie procesate manual sunt acum gestionate în secunde de AI.',
                color: 'from-green-500 to-green-600'
              },
              {
                icon: TrendingUp,
                title: 'Costuri Reduse',
                metric: '€500+',
                metricLabel: 'economii lunare per 10 vehicule',
                description: 'Eliminarea erorilor, detectarea dublurilor și optimizarea consumului reduc costurile operaționale.',
                color: 'from-blue-500 to-blue-600'
              },
              {
                icon: Target,
                title: 'Zero Penalități',
                metric: '0',
                metricLabel: 'amenzi documente expirate',
                description: 'Alertele automate pentru ITP, RCA și atestate vă protejează de amenzi și întârzieri.',
                color: 'from-purple-500 to-purple-600'
              }
            ].map((benefit, idx) => (
              <Card key={idx} className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${benefit.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <benefit.icon className="h-8 w-8 text-white" />
                  </div>

                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>

                  <div className="mb-4">
                    <div className="text-4xl font-bold text-slate-900">{benefit.metric}</div>
                    <div className="text-sm text-slate-500">{benefit.metricLabel}</div>
                  </div>

                  <p className="text-slate-600 leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Early Adopter CTA */}
          <div className="mt-16 text-center">
            <div className="inline-block bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100">
              <h3 className="text-xl font-bold mb-2">Fii printre primii utilizatori</h3>
              <p className="text-slate-600 mb-4">
                Înscrie-te acum și primește 3 luni gratuit + onboarding personalizat
              </p>
              <Button onClick={() => scrollToSection('demo')} className="bg-blue-600 hover:bg-blue-700">
                Solicită Acces Early Adopter
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-16 bg-slate-50 border-y">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-xl font-semibold mb-2">Securitate și Conformitate de Nivel Enterprise</h3>
            <p className="text-slate-500">Datele voastre sunt protejate conform celor mai înalte standarde.</p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <div className="flex items-center gap-3 p-4">
              <Shield className="h-10 w-10 text-green-600" />
              <div>
                <div className="font-semibold">GDPR Compliant</div>
                <div className="text-sm text-slate-500">Date stocate în UE</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4">
              <Lock className="h-10 w-10 text-blue-600" />
              <div>
                <div className="font-semibold">SSL/TLS Encryption</div>
                <div className="text-sm text-slate-500">Criptare 256-bit</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4">
              <Server className="h-10 w-10 text-purple-600" />
              <div>
                <div className="font-semibold">99.9% Uptime SLA</div>
                <div className="text-sm text-slate-500">Disponibilitate garantată</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4">
              <Award className="h-10 w-10 text-orange-600" />
              <div>
                <div className="font-semibold">ISO 27001</div>
                <div className="text-sm text-slate-500">Securitate informații</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-white scroll-mt-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">FAQ</Badge>
            <h2 className="text-3xl font-bold mb-4">Întrebări Frecvente</h2>
            <p className="text-slate-500">Tot ce trebuie să știți despre Floteris.</p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border rounded-lg mb-3 px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <span className="text-left font-medium">Cum funcționează procesarea automată a documentelor?</span>
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-slate-600">
                Folosim modele AI avansate (GPT-4 Vision) pentru a scana și extrage date din documente.
                Sistemul identifică automat furnizorul, data, sumele și numerele de înmatriculare cu 99%
                acuratețe, eliminând introducerea manuală a datelor. Procesarea durează în medie 2-3 secunde per document.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border rounded-lg mb-3 px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <span className="text-left font-medium">Ce furnizori de carduri de carburant sunt suportați?</span>
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-slate-600">
                Floteris suportă import automat din DKV, Eurowag, Verag și Shell. Fișierele Excel/CSV
                sunt procesate automat, cu detectare inteligentă a dublurilor și calcul cost/km per vehicul.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border rounded-lg mb-3 px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <span className="text-left font-medium">Cât durează implementarea?</span>
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-slate-600">
                Setup-ul inițial durează 24-48 de ore. Oferim onboarding gratuit cu demonstrație live,
                import date existente și training pentru echipă. Pentru planul Enterprise, avem consultanți
                dedicați care asigură integrarea cu sistemele voastre existente.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border rounded-lg mb-3 px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <span className="text-left font-medium">Datele mele sunt în siguranță?</span>
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-slate-600">
                Absolut. Folosim criptare SSL/TLS pentru transferuri și AES-256 pentru stocare. Datele
                sunt stocate în centre de date din UE, conform GDPR. Efectuăm backup-uri zilnice și
                avem proceduri de disaster recovery testate regulat. Suntem în proces de certificare ISO 27001.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border rounded-lg mb-3 px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <span className="text-left font-medium">Pot încerca gratuit înainte să mă decid?</span>
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-slate-600">
                Da! Oferim 14 zile de trial gratuit pentru planul Professional, fără să fie nevoie de
                card de credit. Aveți acces la toate funcționalitățile și suport dedicat pentru a testa
                platforma cu datele voastre reale.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Demo Request / CTA */}
      <section id="demo" className="py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Gata să Transformați Managementul Flotei?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Programați o demonstrație personalizată și vedeți cum Floteris poate reduce costurile
              și elimina munca manuală din operațiunile voastre.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Button
                size="lg"
                onClick={() => navigate('/login')}
                className="h-14 px-8 text-lg bg-white text-blue-700 hover:bg-blue-50 shadow-lg font-semibold"
              >
                Începe Trial Gratuit
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg border-2 border-white text-white hover:bg-white/10"
              >
                <Phone className="mr-2 h-5 w-5" />
                Sună: +40 XXX XXX XXX
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-blue-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>14 zile gratuit</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Fără card de credit</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Setup în 24h</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Anulați oricând</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.webp" alt="Floteris" className="h-8 w-8 brightness-0 invert" />
                <span className="text-xl font-bold text-white">Floteris</span>
              </div>
              <p className="text-sm mb-4">
                Platforma de management a flotei preferată de companiile de transport din România.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span>București, România</span>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Produs</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Funcționalități</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Prețuri</button></li>
                <li><button onClick={() => scrollToSection('roi')} className="hover:text-white transition-colors">Calculator ROI</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrări</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Companie</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Despre Noi</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cariere</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:contact@floteris.ro" className="hover:text-white transition-colors">contact@floteris.ro</a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+40 XXX XXX XXX</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm">
              © 2025 Floteris. Toate drepturile rezervate.
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Termeni și Condiții</a>
              <a href="#" className="hover:text-white transition-colors">Politica de Confidențialitate</a>
              <a href="#" className="hover:text-white transition-colors">GDPR</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
