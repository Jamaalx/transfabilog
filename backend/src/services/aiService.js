const OpenAI = require('openai');
const { supabaseAdmin: supabase } = require('../config/supabase');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Get company data summary for AI context
 */
async function getCompanyDataSummary(companyId) {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  // Fetch all relevant data
  const [
    { data: trucks },
    { data: trailers },
    { data: drivers },
    { data: trips },
    { data: transactions },
    { data: documents },
  ] = await Promise.all([
    supabase.from('truck_heads').select('*').eq('company_id', companyId),
    supabase.from('trailers').select('*').eq('company_id', companyId),
    supabase.from('drivers').select('*').eq('company_id', companyId),
    supabase
      .from('trips')
      .select('*, driver:drivers(first_name, last_name), truck:truck_heads(registration_number, brand)')
      .eq('company_id', companyId)
      .gte('departure_date', ninetyDaysAgo.toISOString())
      .order('departure_date', { ascending: false }),
    supabase
      .from('transactions')
      .select('*')
      .eq('company_id', companyId)
      .gte('date', ninetyDaysAgo.toISOString()),
    supabase
      .from('documents')
      .select('*')
      .eq('company_id', companyId)
      .not('expiry_date', 'is', null),
  ]);

  // Calculate key metrics
  const completedTrips = trips?.filter(t => t.status === 'finalizat') || [];
  const activeTrips = trips?.filter(t => t.status === 'in_progress') || [];

  const totalRevenue = completedTrips.reduce((sum, t) => sum + parseFloat(t.price || 0), 0);
  const totalKm = completedTrips.reduce((sum, t) => {
    if (t.km_end && t.km_start) return sum + (t.km_end - t.km_start);
    return sum;
  }, 0);

  const income = transactions?.filter(t => t.type === 'income') || [];
  const expenses = transactions?.filter(t => t.type === 'expense') || [];
  const totalIncome = income.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  // Expense breakdown by category
  const expensesByCategory = expenses.reduce((acc, e) => {
    const cat = e.category || 'altele';
    acc[cat] = (acc[cat] || 0) + parseFloat(e.amount || 0);
    return acc;
  }, {});

  // Driver performance
  const driverPerformance = drivers?.map(driver => {
    const driverTrips = completedTrips.filter(t => t.driver_id === driver.id);
    const driverKm = driverTrips.reduce((sum, t) => {
      if (t.km_end && t.km_start) return sum + (t.km_end - t.km_start);
      return sum;
    }, 0);
    const driverRevenue = driverTrips.reduce((sum, t) => sum + parseFloat(t.price || 0), 0);
    return {
      name: `${driver.first_name} ${driver.last_name}`,
      trips: driverTrips.length,
      km: driverKm,
      revenue: driverRevenue,
      status: driver.status,
    };
  }) || [];

  // Truck performance
  const truckPerformance = trucks?.map(truck => {
    const truckTrips = completedTrips.filter(t => t.truck_id === truck.id);
    const truckKm = truckTrips.reduce((sum, t) => {
      if (t.km_end && t.km_start) return sum + (t.km_end - t.km_start);
      return sum;
    }, 0);
    const truckRevenue = truckTrips.reduce((sum, t) => sum + parseFloat(t.price || 0), 0);
    return {
      registration: truck.registration_number,
      brand: truck.brand,
      trips: truckTrips.length,
      km: truckKm,
      revenue: truckRevenue,
      status: truck.status,
      currentKm: truck.km,
    };
  }) || [];

  // Expiring documents
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  const expiringDocs = documents?.filter(d => new Date(d.expiry_date) <= thirtyDaysFromNow) || [];

  // Trip destinations analysis
  const destinationStats = completedTrips.reduce((acc, t) => {
    const dest = t.destination_country || 'Necunoscut';
    if (!acc[dest]) acc[dest] = { trips: 0, revenue: 0 };
    acc[dest].trips += 1;
    acc[dest].revenue += parseFloat(t.price || 0);
    return acc;
  }, {});

  return {
    fleet: {
      totalTrucks: trucks?.length || 0,
      activeTrucks: trucks?.filter(t => t.status === 'activ').length || 0,
      totalTrailers: trailers?.length || 0,
      activeTrailers: trailers?.filter(t => t.status === 'activ').length || 0,
      totalDrivers: drivers?.length || 0,
      activeDrivers: drivers?.filter(d => d.status === 'activ').length || 0,
    },
    trips: {
      total: trips?.length || 0,
      completed: completedTrips.length,
      active: activeTrips.length,
      planned: trips?.filter(t => t.status === 'planificat').length || 0,
      totalKm,
      totalRevenue,
      avgRevenuePerTrip: completedTrips.length > 0 ? totalRevenue / completedTrips.length : 0,
      avgKmPerTrip: completedTrips.length > 0 ? totalKm / completedTrips.length : 0,
    },
    financial: {
      totalIncome,
      totalExpenses,
      profit: totalIncome - totalExpenses,
      profitMargin: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0,
      expensesByCategory,
    },
    driverPerformance: driverPerformance.sort((a, b) => b.revenue - a.revenue),
    truckPerformance: truckPerformance.sort((a, b) => b.revenue - a.revenue),
    destinations: destinationStats,
    alerts: {
      expiringDocuments: expiringDocs.length,
      documentsDetails: expiringDocs.slice(0, 5).map(d => ({
        type: d.document_type,
        expiryDate: d.expiry_date,
      })),
    },
    recentTrips: completedTrips.slice(0, 10).map(t => ({
      route: `${t.origin_city || t.origin_country} → ${t.destination_city || t.destination_country}`,
      driver: t.driver ? `${t.driver.first_name} ${t.driver.last_name}` : '-',
      truck: t.truck?.registration_number || '-',
      price: t.price,
      date: t.departure_date,
    })),
  };
}

/**
 * Generate AI insights based on company data
 */
async function generateInsights(companyId) {
  const dataSummary = await getCompanyDataSummary(companyId);

  const systemPrompt = `Ești un asistent AI expert în analiza datelor pentru companii de transport.
Analizezi datele unei companii de transport din România și oferi insights valoroase, recomandări practice și identifici oportunități de optimizare.
Răspunde întotdeauna în limba română.
Fii concis, practic și orientat spre acțiune.
Folosește formatare clară cu bullet points și secțiuni.`;

  const userPrompt = `Analizează următoarele date ale companiei de transport și generează insights și recomandări:

REZUMAT DATE (ultimele 90 de zile):

FLOTĂ:
- Camioane: ${dataSummary.fleet.totalTrucks} (active: ${dataSummary.fleet.activeTrucks})
- Remorci: ${dataSummary.fleet.totalTrailers} (active: ${dataSummary.fleet.activeTrailers})
- Șoferi: ${dataSummary.fleet.totalDrivers} (activi: ${dataSummary.fleet.activeDrivers})

CURSE:
- Total curse: ${dataSummary.trips.total}
- Finalizate: ${dataSummary.trips.completed}
- Active: ${dataSummary.trips.active}
- Planificate: ${dataSummary.trips.planned}
- Total km: ${dataSummary.trips.totalKm.toLocaleString()}
- Venit total: €${dataSummary.trips.totalRevenue.toLocaleString()}
- Venit mediu/cursă: €${dataSummary.trips.avgRevenuePerTrip.toFixed(2)}
- Km mediu/cursă: ${dataSummary.trips.avgKmPerTrip.toFixed(0)}

FINANCIAR:
- Venituri totale: €${dataSummary.financial.totalIncome.toLocaleString()}
- Cheltuieli totale: €${dataSummary.financial.totalExpenses.toLocaleString()}
- Profit: €${dataSummary.financial.profit.toLocaleString()}
- Marja profit: ${dataSummary.financial.profitMargin.toFixed(1)}%
- Cheltuieli pe categorii: ${JSON.stringify(dataSummary.financial.expensesByCategory)}

PERFORMANȚĂ ȘOFERI (top):
${dataSummary.driverPerformance.slice(0, 5).map(d => `- ${d.name}: ${d.trips} curse, ${d.km} km, €${d.revenue}`).join('\n')}

PERFORMANȚĂ CAMIOANE (top):
${dataSummary.truckPerformance.slice(0, 5).map(t => `- ${t.registration} (${t.brand}): ${t.trips} curse, ${t.km} km, €${t.revenue}`).join('\n')}

DESTINAȚII POPULARE:
${Object.entries(dataSummary.destinations).map(([dest, stats]) => `- ${dest}: ${stats.trips} curse, €${stats.revenue}`).join('\n')}

ALERTE:
- Documente care expiră în 30 zile: ${dataSummary.alerts.expiringDocuments}

Generează:
1. 📊 ANALIZĂ GENERALĂ (3-4 puncte cheie)
2. 💡 INSIGHTS (identifică patterns și tendințe)
3. ⚠️ RISCURI ȘI ATENȚIONĂRI
4. 🎯 RECOMANDĂRI CONCRETE (5 acțiuni prioritare)
5. 📈 OPORTUNITĂȚI DE OPTIMIZARE`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return {
      insights: response.choices[0].message.content,
      dataSummary,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    // Return local analysis if API fails
    return generateLocalInsights(dataSummary);
  }
}

/**
 * Generate local insights without AI (fallback)
 */
function generateLocalInsights(dataSummary) {
  const insights = [];
  const recommendations = [];
  const risks = [];

  // Analyze profit margin
  if (dataSummary.financial.profitMargin < 10) {
    risks.push('⚠️ Marja de profit este sub 10% - necesită atenție urgentă');
    recommendations.push('Analizați și reduceți cheltuielile sau negociați prețuri mai bune pentru curse');
  } else if (dataSummary.financial.profitMargin > 25) {
    insights.push('💪 Marja de profit excelentă (peste 25%)');
  }

  // Analyze fleet utilization
  const truckUtilization = dataSummary.fleet.activeTrucks > 0
    ? dataSummary.trips.completed / dataSummary.fleet.activeTrucks
    : 0;
  if (truckUtilization < 5) {
    recommendations.push('Utilizarea flotei pare scăzută - considerați mai multe curse per camion');
  }

  // Analyze expenses
  const expenseCategories = dataSummary.financial.expensesByCategory;
  const topExpense = Object.entries(expenseCategories).sort((a, b) => b[1] - a[1])[0];
  if (topExpense) {
    insights.push(`📊 Cea mai mare categorie de cheltuieli: ${topExpense[0]} (€${topExpense[1].toLocaleString()})`);
    if (topExpense[0] === 'combustibil' && topExpense[1] > dataSummary.financial.totalExpenses * 0.4) {
      recommendations.push('Combustibilul reprezintă peste 40% din cheltuieli - optimizați rutele sau negociați contracte de carburant');
    }
  }

  // Analyze documents
  if (dataSummary.alerts.expiringDocuments > 0) {
    risks.push(`📋 ${dataSummary.alerts.expiringDocuments} documente expiră în următoarele 30 de zile`);
    recommendations.push('Reînnoiți documentele care expiră pentru a evita amenzi și întreruperi');
  }

  // Analyze driver performance
  if (dataSummary.driverPerformance.length > 1) {
    const topDriver = dataSummary.driverPerformance[0];
    const bottomDriver = dataSummary.driverPerformance[dataSummary.driverPerformance.length - 1];
    if (topDriver.revenue > bottomDriver.revenue * 2) {
      insights.push(`👨‍✈️ Diferență mare între performanța șoferilor: ${topDriver.name} (€${topDriver.revenue}) vs ${bottomDriver.name} (€${bottomDriver.revenue})`);
      recommendations.push('Analizați ce face diferit șoferul cu cea mai bună performanță și aplicați best practices');
    }
  }

  // Revenue per km analysis
  const revenuePerKm = dataSummary.trips.totalKm > 0
    ? dataSummary.trips.totalRevenue / dataSummary.trips.totalKm
    : 0;
  insights.push(`💰 Venit mediu per km: €${revenuePerKm.toFixed(2)}`);
  if (revenuePerKm < 1) {
    recommendations.push('Venitul per km este sub €1 - considerați curse mai profitabile sau negociați prețuri mai bune');
  }

  return {
    insights: `
## 📊 ANALIZĂ AUTOMATĂ

### Metrici Cheie
- Profit total: €${dataSummary.financial.profit.toLocaleString()}
- Marja profit: ${dataSummary.financial.profitMargin.toFixed(1)}%
- Curse finalizate: ${dataSummary.trips.completed}
- Km totali: ${dataSummary.trips.totalKm.toLocaleString()}

### 💡 Insights
${insights.map(i => `- ${i}`).join('\n')}

### ⚠️ Riscuri și Atenționări
${risks.length > 0 ? risks.map(r => `- ${r}`).join('\n') : '- Niciun risc major identificat'}

### 🎯 Recomandări
${recommendations.length > 0 ? recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n') : '- Continuați strategia actuală'}

---
*Analiză generată automat pe baza datelor disponibile*
`,
    dataSummary,
    generatedAt: new Date().toISOString(),
    isLocalAnalysis: true,
  };
}

/**
 * Chat with AI about company data
 */
async function chatWithAI(companyId, message, conversationHistory = []) {
  const dataSummary = await getCompanyDataSummary(companyId);

  const systemPrompt = `Ești un asistent AI expert pentru o companie de transport din România.
Ai acces la datele companiei și poți răspunde la întrebări despre flotă, curse, finanțe, șoferi, și poți oferi recomandări.
Răspunde întotdeauna în limba română, concis și util.
Dacă nu ai suficiente date pentru a răspunde precis, spune acest lucru.

CONTEXT - Date companie (ultimele 90 zile):
- Flotă: ${dataSummary.fleet.totalTrucks} camioane, ${dataSummary.fleet.totalDrivers} șoferi
- Curse finalizate: ${dataSummary.trips.completed}, Total km: ${dataSummary.trips.totalKm}
- Venituri: €${dataSummary.financial.totalIncome.toLocaleString()}
- Cheltuieli: €${dataSummary.financial.totalExpenses.toLocaleString()}
- Profit: €${dataSummary.financial.profit.toLocaleString()} (${dataSummary.financial.profitMargin.toFixed(1)}%)
- Top șoferi: ${dataSummary.driverPerformance.slice(0, 3).map(d => d.name).join(', ')}
- Top camioane: ${dataSummary.truckPerformance.slice(0, 3).map(t => t.registration).join(', ')}
- Cheltuieli: ${JSON.stringify(dataSummary.financial.expensesByCategory)}
- Destinații: ${JSON.stringify(dataSummary.destinations)}
- Alerte documente: ${dataSummary.alerts.expiringDocuments}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-10), // Keep last 10 messages for context
    { role: 'user', content: message },
  ];

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return {
      response: response.choices[0].message.content,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return {
      response: 'Ne pare rău, serviciul AI nu este disponibil momentan. Vă rugăm încercați din nou mai târziu.',
      timestamp: new Date().toISOString(),
      error: true,
    };
  }
}

/**
 * Generate predictions for future expenses and revenue
 */
async function generatePredictions(companyId) {
  const dataSummary = await getCompanyDataSummary(companyId);

  // Simple trend analysis based on available data
  const avgMonthlyRevenue = dataSummary.financial.totalIncome / 3; // 90 days = ~3 months
  const avgMonthlyExpenses = dataSummary.financial.totalExpenses / 3;
  const avgTripsPerMonth = dataSummary.trips.completed / 3;

  const predictions = {
    nextMonth: {
      estimatedRevenue: avgMonthlyRevenue * 1.05, // Assume 5% growth
      estimatedExpenses: avgMonthlyExpenses * 1.02, // Assume 2% expense increase
      estimatedTrips: Math.round(avgTripsPerMonth),
      estimatedProfit: (avgMonthlyRevenue * 1.05) - (avgMonthlyExpenses * 1.02),
    },
    nextQuarter: {
      estimatedRevenue: avgMonthlyRevenue * 3 * 1.1,
      estimatedExpenses: avgMonthlyExpenses * 3 * 1.05,
      estimatedTrips: Math.round(avgTripsPerMonth * 3),
      estimatedProfit: (avgMonthlyRevenue * 3 * 1.1) - (avgMonthlyExpenses * 3 * 1.05),
    },
    trends: {
      revenueGrowth: dataSummary.trips.completed > 0 ? 'pozitiv' : 'insuficiente date',
      expensesTrend: 'stabil',
      profitabilityTrend: dataSummary.financial.profitMargin > 15 ? 'bun' : 'necesită atenție',
    },
    recommendations: [],
  };

  // Add recommendations based on predictions
  if (predictions.nextMonth.estimatedProfit < 0) {
    predictions.recommendations.push('Atenție: Profitul estimat pentru luna viitoare este negativ. Reduceți cheltuielile sau creșteți numărul de curse.');
  }

  if (dataSummary.alerts.expiringDocuments > 0) {
    predictions.recommendations.push(`Planificați reînnoirea celor ${dataSummary.alerts.expiringDocuments} documente care expiră curând.`);
  }

  const fuelExpense = dataSummary.financial.expensesByCategory.combustibil || 0;
  if (fuelExpense > dataSummary.financial.totalExpenses * 0.35) {
    predictions.recommendations.push('Cheltuielile cu combustibilul sunt ridicate. Considerați optimizarea rutelor sau negocierea de contracte mai bune.');
  }

  return {
    predictions,
    basedOnData: {
      period: 'ultimele 90 de zile',
      trips: dataSummary.trips.completed,
      revenue: dataSummary.financial.totalIncome,
      expenses: dataSummary.financial.totalExpenses,
    },
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Get smart recommendations for optimization
 */
async function getOptimizationRecommendations(companyId) {
  const dataSummary = await getCompanyDataSummary(companyId);
  const recommendations = [];

  // Fleet optimization
  const unusedTrucks = dataSummary.fleet.totalTrucks - dataSummary.fleet.activeTrucks;
  if (unusedTrucks > 0) {
    recommendations.push({
      category: 'Flotă',
      priority: 'medie',
      title: 'Camioane inactive',
      description: `Aveți ${unusedTrucks} camioane inactive. Considerați activarea lor sau vânzarea pentru a reduce costurile de întreținere.`,
      potentialSavings: unusedTrucks * 500, // Estimated €500/month per inactive truck
    });
  }

  // Route optimization
  const avgKmPerTrip = dataSummary.trips.avgKmPerTrip;
  const avgRevenuePerKm = dataSummary.trips.totalKm > 0
    ? dataSummary.trips.totalRevenue / dataSummary.trips.totalKm
    : 0;

  if (avgRevenuePerKm < 1.2) {
    recommendations.push({
      category: 'Rute',
      priority: 'ridicată',
      title: 'Venit scăzut per km',
      description: `Venitul mediu per km (€${avgRevenuePerKm.toFixed(2)}) este sub optim. Negociați prețuri mai bune sau căutați curse mai profitabile.`,
      potentialSavings: dataSummary.trips.totalKm * 0.3, // €0.30 potential increase per km
    });
  }

  // Expense optimization
  const expenseCategories = dataSummary.financial.expensesByCategory;
  Object.entries(expenseCategories).forEach(([category, amount]) => {
    const percentage = (amount / dataSummary.financial.totalExpenses) * 100;
    if (category === 'combustibil' && percentage > 40) {
      recommendations.push({
        category: 'Cheltuieli',
        priority: 'ridicată',
        title: 'Optimizare combustibil',
        description: `Combustibilul reprezintă ${percentage.toFixed(1)}% din cheltuieli. Implementați carduri de flotă, optimizați rutele, și monitorizați consumul pe camion.`,
        potentialSavings: amount * 0.1, // 10% potential savings
      });
    }
    if (category === 'reparatii' && percentage > 15) {
      recommendations.push({
        category: 'Mentenanță',
        priority: 'medie',
        title: 'Costuri reparații ridicate',
        description: `Cheltuielile cu reparațiile sunt ${percentage.toFixed(1)}% din total. Implementați un program de mentenanță preventivă.`,
        potentialSavings: amount * 0.2, // 20% potential savings
      });
    }
  });

  // Driver optimization
  if (dataSummary.driverPerformance.length > 2) {
    const topDriver = dataSummary.driverPerformance[0];
    const avgDriverRevenue = dataSummary.driverPerformance.reduce((sum, d) => sum + d.revenue, 0) / dataSummary.driverPerformance.length;
    const underperformingDrivers = dataSummary.driverPerformance.filter(d => d.revenue < avgDriverRevenue * 0.7);

    if (underperformingDrivers.length > 0) {
      recommendations.push({
        category: 'Personal',
        priority: 'medie',
        title: 'Performanță șoferi',
        description: `${underperformingDrivers.length} șoferi au performanță sub medie. Analizați motivele și oferiți training sau realocați curse.`,
        potentialSavings: underperformingDrivers.length * avgDriverRevenue * 0.3,
      });
    }
  }

  // Document compliance
  if (dataSummary.alerts.expiringDocuments > 0) {
    recommendations.push({
      category: 'Conformitate',
      priority: 'urgentă',
      title: 'Documente care expiră',
      description: `${dataSummary.alerts.expiringDocuments} documente expiră în 30 de zile. Planificați reînnoirea pentru a evita amenzi și întreruperi.`,
      potentialSavings: dataSummary.alerts.expiringDocuments * 1000, // Potential fines avoided
    });
  }

  // Sort by priority
  const priorityOrder = { urgentă: 0, ridicată: 1, medie: 2, scăzută: 3 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return {
    recommendations,
    totalPotentialSavings: recommendations.reduce((sum, r) => sum + (r.potentialSavings || 0), 0),
    analysisDate: new Date().toISOString(),
    dataContext: {
      fleet: dataSummary.fleet,
      financialSummary: {
        revenue: dataSummary.financial.totalIncome,
        expenses: dataSummary.financial.totalExpenses,
        profit: dataSummary.financial.profit,
      },
    },
  };
}

module.exports = {
  getCompanyDataSummary,
  generateInsights,
  chatWithAI,
  generatePredictions,
  getOptimizationRecommendations,
};
