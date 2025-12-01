const express = require('express');
const { query, validationResult } = require('express-validator');
const { supabaseAdmin: supabase } = require('../config/supabase');
const { authenticate, requireAdminDb } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and admin database access
router.use(authenticate);
router.use(requireAdminDb);

/**
 * GET /api/v1/reports/financial
 * Get comprehensive financial report
 */
router.get(
  '/financial',
  [
    query('date_from').optional().isISO8601(),
    query('date_to').optional().isISO8601(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const dateFrom = req.query.date_from || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const dateTo = req.query.date_to || new Date().toISOString();

      // Get all transactions in period
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('company_id', req.companyId)
        .gte('date', dateFrom)
        .lte('date', dateTo)
        .order('date', { ascending: true });

      if (error) throw error;

      // Calculate totals
      const income = transactions.filter(t => t.type === 'income');
      const expenses = transactions.filter(t => t.type === 'expense');

      const totalIncome = income.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      const totalExpenses = expenses.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      // Group expenses by category
      const expensesByCategory = expenses.reduce((acc, t) => {
        const cat = t.category || 'altele';
        if (!acc[cat]) {
          acc[cat] = { total: 0, count: 0, transactions: [] };
        }
        acc[cat].total += parseFloat(t.amount || 0);
        acc[cat].count += 1;
        acc[cat].transactions.push(t);
        return acc;
      }, {});

      // Group income by category
      const incomeByCategory = income.reduce((acc, t) => {
        const cat = t.category || 'transport';
        if (!acc[cat]) {
          acc[cat] = { total: 0, count: 0, transactions: [] };
        }
        acc[cat].total += parseFloat(t.amount || 0);
        acc[cat].count += 1;
        acc[cat].transactions.push(t);
        return acc;
      }, {});

      // Group by month for chart data
      const monthlyData = transactions.reduce((acc, t) => {
        const month = t.date.substring(0, 7); // YYYY-MM
        if (!acc[month]) {
          acc[month] = { income: 0, expenses: 0 };
        }
        if (t.type === 'income') {
          acc[month].income += parseFloat(t.amount || 0);
        } else {
          acc[month].expenses += parseFloat(t.amount || 0);
        }
        return acc;
      }, {});

      res.json({
        period: { from: dateFrom, to: dateTo },
        summary: {
          totalIncome,
          totalExpenses,
          profit: totalIncome - totalExpenses,
          profitMargin: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(2) : 0,
          transactionCount: transactions.length,
        },
        expensesByCategory,
        incomeByCategory,
        monthlyData,
        currency: 'EUR',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/reports/trips
 * Get comprehensive trips report
 */
router.get(
  '/trips',
  [
    query('date_from').optional().isISO8601(),
    query('date_to').optional().isISO8601(),
    query('driver_id').optional().isUUID(),
    query('truck_id').optional().isUUID(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const dateFrom = req.query.date_from || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const dateTo = req.query.date_to || new Date().toISOString();

      let queryBuilder = supabase
        .from('trips')
        .select(`
          *,
          driver:drivers(id, first_name, last_name),
          truck:truck_heads(id, registration_number, brand),
          trailer:trailers(id, registration_number)
        `)
        .eq('company_id', req.companyId)
        .gte('departure_date', dateFrom)
        .lte('departure_date', dateTo)
        .order('departure_date', { ascending: false });

      if (req.query.driver_id) {
        queryBuilder = queryBuilder.eq('driver_id', req.query.driver_id);
      }

      if (req.query.truck_id) {
        queryBuilder = queryBuilder.eq('truck_id', req.query.truck_id);
      }

      const { data: trips, error } = await queryBuilder;

      if (error) throw error;

      // Calculate statistics
      const completedTrips = trips.filter(t => t.status === 'finalizat');
      const activeTrips = trips.filter(t => t.status === 'in_progress');
      const plannedTrips = trips.filter(t => t.status === 'planificat');
      const cancelledTrips = trips.filter(t => t.status === 'anulat');

      const totalRevenue = completedTrips.reduce((sum, t) => sum + parseFloat(t.price || 0), 0);
      const totalKm = completedTrips.reduce((sum, t) => {
        if (t.km_end && t.km_start) {
          return sum + (t.km_end - t.km_start);
        }
        return sum;
      }, 0);

      // Group by driver
      const tripsByDriver = trips.reduce((acc, t) => {
        const driverName = t.driver ? `${t.driver.first_name} ${t.driver.last_name}` : 'Neasignat';
        const driverId = t.driver?.id || 'unassigned';
        if (!acc[driverId]) {
          acc[driverId] = {
            name: driverName,
            trips: 0,
            completedTrips: 0,
            revenue: 0,
            km: 0,
          };
        }
        acc[driverId].trips += 1;
        if (t.status === 'finalizat') {
          acc[driverId].completedTrips += 1;
          acc[driverId].revenue += parseFloat(t.price || 0);
          if (t.km_end && t.km_start) {
            acc[driverId].km += (t.km_end - t.km_start);
          }
        }
        return acc;
      }, {});

      // Group by truck
      const tripsByTruck = trips.reduce((acc, t) => {
        const truckReg = t.truck?.registration_number || 'Neasignat';
        const truckId = t.truck?.id || 'unassigned';
        if (!acc[truckId]) {
          acc[truckId] = {
            registration: truckReg,
            brand: t.truck?.brand || '-',
            trips: 0,
            completedTrips: 0,
            revenue: 0,
            km: 0,
          };
        }
        acc[truckId].trips += 1;
        if (t.status === 'finalizat') {
          acc[truckId].completedTrips += 1;
          acc[truckId].revenue += parseFloat(t.price || 0);
          if (t.km_end && t.km_start) {
            acc[truckId].km += (t.km_end - t.km_start);
          }
        }
        return acc;
      }, {});

      // Group by destination country
      const tripsByDestination = trips.reduce((acc, t) => {
        const country = t.destination_country || 'Necunoscut';
        if (!acc[country]) {
          acc[country] = { trips: 0, revenue: 0 };
        }
        acc[country].trips += 1;
        acc[country].revenue += parseFloat(t.price || 0);
        return acc;
      }, {});

      // Monthly trend
      const monthlyTrips = trips.reduce((acc, t) => {
        const month = t.departure_date.substring(0, 7);
        if (!acc[month]) {
          acc[month] = { trips: 0, revenue: 0, km: 0 };
        }
        acc[month].trips += 1;
        acc[month].revenue += parseFloat(t.price || 0);
        if (t.km_end && t.km_start) {
          acc[month].km += (t.km_end - t.km_start);
        }
        return acc;
      }, {});

      res.json({
        period: { from: dateFrom, to: dateTo },
        summary: {
          totalTrips: trips.length,
          completedTrips: completedTrips.length,
          activeTrips: activeTrips.length,
          plannedTrips: plannedTrips.length,
          cancelledTrips: cancelledTrips.length,
          totalRevenue,
          totalKm,
          avgRevenuePerTrip: completedTrips.length > 0 ? (totalRevenue / completedTrips.length).toFixed(2) : 0,
          avgKmPerTrip: completedTrips.length > 0 ? Math.round(totalKm / completedTrips.length) : 0,
        },
        tripsByDriver: Object.values(tripsByDriver),
        tripsByTruck: Object.values(tripsByTruck),
        tripsByDestination,
        monthlyTrips,
        trips,
        currency: 'EUR',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/reports/fleet
 * Get fleet utilization report
 */
router.get('/fleet', async (req, res, next) => {
  try {
    const dateFrom = req.query.date_from || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const dateTo = req.query.date_to || new Date().toISOString();

    // Get all trucks
    const { data: trucks, error: trucksError } = await supabase
      .from('truck_heads')
      .select('*')
      .eq('company_id', req.companyId);

    if (trucksError) throw trucksError;

    // Get all trailers
    const { data: trailers, error: trailersError } = await supabase
      .from('trailers')
      .select('*')
      .eq('company_id', req.companyId);

    if (trailersError) throw trailersError;

    // Get all drivers
    const { data: drivers, error: driversError } = await supabase
      .from('drivers')
      .select('*')
      .eq('company_id', req.companyId);

    if (driversError) throw driversError;

    // Get trips in period for utilization calculation
    const { data: trips, error: tripsError } = await supabase
      .from('trips')
      .select('*')
      .eq('company_id', req.companyId)
      .gte('departure_date', dateFrom)
      .lte('departure_date', dateTo);

    if (tripsError) throw tripsError;

    // Calculate truck utilization
    const truckUtilization = trucks.map(truck => {
      const truckTrips = trips.filter(t => t.truck_id === truck.id);
      const completedTrips = truckTrips.filter(t => t.status === 'finalizat');
      const totalKm = completedTrips.reduce((sum, t) => {
        if (t.km_end && t.km_start) return sum + (t.km_end - t.km_start);
        return sum;
      }, 0);
      const revenue = completedTrips.reduce((sum, t) => sum + parseFloat(t.price || 0), 0);

      return {
        id: truck.id,
        registration: truck.registration_number,
        brand: truck.brand,
        model: truck.model,
        status: truck.status,
        totalTrips: truckTrips.length,
        completedTrips: completedTrips.length,
        totalKm,
        revenue,
        revenuePerKm: totalKm > 0 ? (revenue / totalKm).toFixed(2) : 0,
      };
    });

    // Calculate driver utilization
    const driverUtilization = drivers.map(driver => {
      const driverTrips = trips.filter(t => t.driver_id === driver.id);
      const completedTrips = driverTrips.filter(t => t.status === 'finalizat');
      const totalKm = completedTrips.reduce((sum, t) => {
        if (t.km_end && t.km_start) return sum + (t.km_end - t.km_start);
        return sum;
      }, 0);
      const revenue = completedTrips.reduce((sum, t) => sum + parseFloat(t.price || 0), 0);

      return {
        id: driver.id,
        name: `${driver.first_name} ${driver.last_name}`,
        status: driver.status,
        totalTrips: driverTrips.length,
        completedTrips: completedTrips.length,
        totalKm,
        revenue,
        avgRevenuePerTrip: completedTrips.length > 0 ? (revenue / completedTrips.length).toFixed(2) : 0,
      };
    });

    res.json({
      period: { from: dateFrom, to: dateTo },
      summary: {
        totalTrucks: trucks.length,
        activeTrucks: trucks.filter(t => t.status === 'activ').length,
        totalTrailers: trailers.length,
        activeTrailers: trailers.filter(t => t.status === 'activ').length,
        totalDrivers: drivers.length,
        activeDrivers: drivers.filter(d => d.status === 'activ').length,
      },
      truckUtilization,
      driverUtilization,
      currency: 'EUR',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/reports/expenses
 * Get detailed expenses report
 */
router.get(
  '/expenses',
  [
    query('date_from').optional().isISO8601(),
    query('date_to').optional().isISO8601(),
    query('category').optional().isString(),
    query('truck_id').optional().isUUID(),
    query('driver_id').optional().isUUID(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const dateFrom = req.query.date_from || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const dateTo = req.query.date_to || new Date().toISOString();

      let queryBuilder = supabase
        .from('transactions')
        .select('*')
        .eq('company_id', req.companyId)
        .eq('type', 'expense')
        .gte('date', dateFrom)
        .lte('date', dateTo)
        .order('date', { ascending: false });

      if (req.query.category) {
        queryBuilder = queryBuilder.eq('category', req.query.category);
      }

      if (req.query.truck_id) {
        queryBuilder = queryBuilder.eq('truck_id', req.query.truck_id);
      }

      if (req.query.driver_id) {
        queryBuilder = queryBuilder.eq('driver_id', req.query.driver_id);
      }

      const { data: expenses, error } = await queryBuilder;

      if (error) throw error;

      const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

      // Group by category
      const byCategory = expenses.reduce((acc, e) => {
        const cat = e.category || 'altele';
        if (!acc[cat]) {
          acc[cat] = { total: 0, count: 0, percentage: 0 };
        }
        acc[cat].total += parseFloat(e.amount || 0);
        acc[cat].count += 1;
        return acc;
      }, {});

      // Calculate percentages
      Object.keys(byCategory).forEach(cat => {
        byCategory[cat].percentage = totalExpenses > 0
          ? ((byCategory[cat].total / totalExpenses) * 100).toFixed(1)
          : 0;
      });

      // Group by payment method
      const byPaymentMethod = expenses.reduce((acc, e) => {
        const method = e.payment_method || 'cash';
        if (!acc[method]) {
          acc[method] = { total: 0, count: 0 };
        }
        acc[method].total += parseFloat(e.amount || 0);
        acc[method].count += 1;
        return acc;
      }, {});

      // Daily trend
      const dailyExpenses = expenses.reduce((acc, e) => {
        const day = e.date.substring(0, 10);
        if (!acc[day]) {
          acc[day] = 0;
        }
        acc[day] += parseFloat(e.amount || 0);
        return acc;
      }, {});

      res.json({
        period: { from: dateFrom, to: dateTo },
        summary: {
          totalExpenses,
          transactionCount: expenses.length,
          avgExpense: expenses.length > 0 ? (totalExpenses / expenses.length).toFixed(2) : 0,
        },
        byCategory,
        byPaymentMethod,
        dailyExpenses,
        expenses,
        currency: 'EUR',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/reports/documents
 * Get documents expiration report
 */
router.get('/documents', async (req, res, next) => {
  try {
    const today = new Date();
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    const sixtyDays = new Date();
    sixtyDays.setDate(sixtyDays.getDate() + 60);
    const ninetyDays = new Date();
    ninetyDays.setDate(ninetyDays.getDate() + 90);

    // Get all documents with expiry dates
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .eq('company_id', req.companyId)
      .not('expiry_date', 'is', null)
      .order('expiry_date', { ascending: true });

    if (docsError) throw docsError;

    // Get driver license and medical expirations
    const { data: drivers, error: driversError } = await supabase
      .from('drivers')
      .select('id, first_name, last_name, license_expiry, medical_expiry')
      .eq('company_id', req.companyId)
      .eq('status', 'activ');

    if (driversError) throw driversError;

    // Categorize documents
    const expired = documents.filter(d => new Date(d.expiry_date) < today);
    const expiringIn30Days = documents.filter(d => {
      const expiry = new Date(d.expiry_date);
      return expiry >= today && expiry <= thirtyDays;
    });
    const expiringIn60Days = documents.filter(d => {
      const expiry = new Date(d.expiry_date);
      return expiry > thirtyDays && expiry <= sixtyDays;
    });
    const expiringIn90Days = documents.filter(d => {
      const expiry = new Date(d.expiry_date);
      return expiry > sixtyDays && expiry <= ninetyDays;
    });

    // Driver documents
    const driverAlerts = [];
    drivers.forEach(driver => {
      if (driver.license_expiry) {
        const expiry = new Date(driver.license_expiry);
        if (expiry <= ninetyDays) {
          driverAlerts.push({
            type: 'license',
            driverId: driver.id,
            driverName: `${driver.first_name} ${driver.last_name}`,
            expiryDate: driver.license_expiry,
            status: expiry < today ? 'expired' : expiry <= thirtyDays ? 'critical' : expiry <= sixtyDays ? 'warning' : 'attention',
          });
        }
      }
      if (driver.medical_expiry) {
        const expiry = new Date(driver.medical_expiry);
        if (expiry <= ninetyDays) {
          driverAlerts.push({
            type: 'medical',
            driverId: driver.id,
            driverName: `${driver.first_name} ${driver.last_name}`,
            expiryDate: driver.medical_expiry,
            status: expiry < today ? 'expired' : expiry <= thirtyDays ? 'critical' : expiry <= sixtyDays ? 'warning' : 'attention',
          });
        }
      }
    });

    res.json({
      summary: {
        totalDocuments: documents.length,
        expired: expired.length,
        expiringIn30Days: expiringIn30Days.length,
        expiringIn60Days: expiringIn60Days.length,
        expiringIn90Days: expiringIn90Days.length,
      },
      expired,
      expiringIn30Days,
      expiringIn60Days,
      expiringIn90Days,
      driverAlerts,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/reports/profitability
 * Get comprehensive profitability report per trip, truck, and driver
 */
router.get(
  '/profitability',
  [
    query('date_from').optional().isISO8601(),
    query('date_to').optional().isISO8601(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const dateFrom = req.query.date_from || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const dateTo = req.query.date_to || new Date().toISOString();

      // Get all trips in period with driver and truck info
      const { data: trips, error: tripsError } = await supabase
        .from('trips')
        .select(`
          *,
          driver:drivers(id, first_name, last_name),
          truck:truck_heads(id, registration_number, brand, model)
        `)
        .eq('company_id', req.companyId)
        .gte('departure_date', dateFrom)
        .lte('departure_date', dateTo)
        .order('departure_date', { ascending: false });

      if (tripsError) throw tripsError;

      // Get all expense transactions in period
      const { data: expenses, error: expensesError } = await supabase
        .from('transactions')
        .select('*')
        .eq('company_id', req.companyId)
        .eq('type', 'expense')
        .gte('date', dateFrom)
        .lte('date', dateTo);

      if (expensesError) throw expensesError;

      // ===== PROFITABILITY PER TRIP =====
      const tripProfitability = trips.map(trip => {
        const tripExpenses = expenses.filter(e => e.trip_id === trip.id);
        const totalExpenses = tripExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
        const revenue = parseFloat(trip.price || 0);
        const profit = revenue - totalExpenses;
        const km = (trip.km_end && trip.km_start) ? (trip.km_end - trip.km_start) : 0;

        return {
          id: trip.id,
          route: `${trip.origin_city || trip.origin_country || '-'} → ${trip.destination_city || trip.destination_country || '-'}`,
          driver: trip.driver ? `${trip.driver.first_name} ${trip.driver.last_name}` : 'Neasignat',
          driverId: trip.driver?.id,
          truck: trip.truck?.registration_number || 'Neasignat',
          truckId: trip.truck?.id,
          date: trip.departure_date,
          status: trip.status,
          km,
          revenue,
          expenses: totalExpenses,
          profit,
          profitMargin: revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0,
          revenuePerKm: km > 0 ? (revenue / km).toFixed(2) : 0,
          profitPerKm: km > 0 ? (profit / km).toFixed(2) : 0,
          expenseBreakdown: tripExpenses.reduce((acc, e) => {
            const cat = e.category || 'altele';
            acc[cat] = (acc[cat] || 0) + parseFloat(e.amount || 0);
            return acc;
          }, {}),
        };
      });

      // ===== PROFITABILITY PER TRUCK =====
      const truckMap = {};
      trips.forEach(trip => {
        const truckId = trip.truck?.id || 'unassigned';
        if (!truckMap[truckId]) {
          truckMap[truckId] = {
            id: truckId,
            registration: trip.truck?.registration_number || 'Neasignat',
            brand: trip.truck?.brand || '-',
            model: trip.truck?.model || '-',
            trips: [],
            tripCount: 0,
            completedTrips: 0,
            totalKm: 0,
            revenue: 0,
            expenses: 0,
          };
        }
        truckMap[truckId].trips.push(trip.id);
        truckMap[truckId].tripCount += 1;
        if (trip.status === 'finalizat') {
          truckMap[truckId].completedTrips += 1;
          truckMap[truckId].revenue += parseFloat(trip.price || 0);
          if (trip.km_end && trip.km_start) {
            truckMap[truckId].totalKm += (trip.km_end - trip.km_start);
          }
        }
      });

      // Add expenses to trucks (both trip-related and direct truck expenses)
      expenses.forEach(expense => {
        // If expense is linked to a trip, find the truck
        if (expense.trip_id) {
          const trip = trips.find(t => t.id === expense.trip_id);
          if (trip?.truck?.id && truckMap[trip.truck.id]) {
            truckMap[trip.truck.id].expenses += parseFloat(expense.amount || 0);
          }
        }
        // If expense is directly linked to a truck
        else if (expense.truck_id && truckMap[expense.truck_id]) {
          truckMap[expense.truck_id].expenses += parseFloat(expense.amount || 0);
        }
      });

      const truckProfitability = Object.values(truckMap).map((truck) => ({
        ...truck,
        profit: truck.revenue - truck.expenses,
        profitMargin: truck.revenue > 0 ? (((truck.revenue - truck.expenses) / truck.revenue) * 100).toFixed(1) : 0,
        revenuePerKm: truck.totalKm > 0 ? (truck.revenue / truck.totalKm).toFixed(2) : 0,
        profitPerKm: truck.totalKm > 0 ? ((truck.revenue - truck.expenses) / truck.totalKm).toFixed(2) : 0,
        avgRevenuePerTrip: truck.completedTrips > 0 ? (truck.revenue / truck.completedTrips).toFixed(2) : 0,
      }));

      // ===== PROFITABILITY PER DRIVER =====
      const driverMap = {};
      trips.forEach(trip => {
        const driverId = trip.driver?.id || 'unassigned';
        if (!driverMap[driverId]) {
          driverMap[driverId] = {
            id: driverId,
            name: trip.driver ? `${trip.driver.first_name} ${trip.driver.last_name}` : 'Neasignat',
            trips: [],
            tripCount: 0,
            completedTrips: 0,
            totalKm: 0,
            revenue: 0,
            expenses: 0,
          };
        }
        driverMap[driverId].trips.push(trip.id);
        driverMap[driverId].tripCount += 1;
        if (trip.status === 'finalizat') {
          driverMap[driverId].completedTrips += 1;
          driverMap[driverId].revenue += parseFloat(trip.price || 0);
          if (trip.km_end && trip.km_start) {
            driverMap[driverId].totalKm += (trip.km_end - trip.km_start);
          }
        }
      });

      // Add expenses to drivers (both trip-related and direct driver expenses)
      expenses.forEach(expense => {
        // If expense is linked to a trip, find the driver
        if (expense.trip_id) {
          const trip = trips.find(t => t.id === expense.trip_id);
          if (trip?.driver?.id && driverMap[trip.driver.id]) {
            driverMap[trip.driver.id].expenses += parseFloat(expense.amount || 0);
          }
        }
        // If expense is directly linked to a driver
        else if (expense.driver_id && driverMap[expense.driver_id]) {
          driverMap[expense.driver_id].expenses += parseFloat(expense.amount || 0);
        }
      });

      const driverProfitability = Object.values(driverMap).map((driver) => ({
        ...driver,
        profit: driver.revenue - driver.expenses,
        profitMargin: driver.revenue > 0 ? (((driver.revenue - driver.expenses) / driver.revenue) * 100).toFixed(1) : 0,
        revenuePerKm: driver.totalKm > 0 ? (driver.revenue / driver.totalKm).toFixed(2) : 0,
        profitPerKm: driver.totalKm > 0 ? ((driver.revenue - driver.expenses) / driver.totalKm).toFixed(2) : 0,
        avgRevenuePerTrip: driver.completedTrips > 0 ? (driver.revenue / driver.completedTrips).toFixed(2) : 0,
      }));

      // ===== TOTALS =====
      const totalRevenue = trips.filter(t => t.status === 'finalizat').reduce((sum, t) => sum + parseFloat(t.price || 0), 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
      const totalKm = trips.filter(t => t.status === 'finalizat').reduce((sum, t) => {
        if (t.km_end && t.km_start) return sum + (t.km_end - t.km_start);
        return sum;
      }, 0);

      res.json({
        period: { from: dateFrom, to: dateTo },
        summary: {
          totalTrips: trips.length,
          completedTrips: trips.filter(t => t.status === 'finalizat').length,
          totalRevenue,
          totalExpenses,
          totalProfit: totalRevenue - totalExpenses,
          profitMargin: totalRevenue > 0 ? (((totalRevenue - totalExpenses) / totalRevenue) * 100).toFixed(1) : 0,
          totalKm,
          revenuePerKm: totalKm > 0 ? (totalRevenue / totalKm).toFixed(2) : 0,
          profitPerKm: totalKm > 0 ? ((totalRevenue - totalExpenses) / totalKm).toFixed(2) : 0,
        },
        tripProfitability,
        truckProfitability: truckProfitability.sort((a, b) => b.profit - a.profit),
        driverProfitability: driverProfitability.sort((a, b) => b.profit - a.profit),
        currency: 'EUR',
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
