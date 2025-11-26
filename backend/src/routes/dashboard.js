const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/dashboard/stats
 * Get dashboard statistics overview
 */
router.get('/stats', async (req, res, next) => {
  try {
    // Get counts in parallel
    const [
      trucksResult,
      trailersResult,
      driversResult,
      activeTripsResult,
      thisMonthTripsResult,
    ] = await Promise.all([
      // Active trucks count
      supabase
        .from('truck_heads')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', req.companyId)
        .eq('status', 'activ'),

      // Active trailers count
      supabase
        .from('trailers')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', req.companyId)
        .eq('status', 'activ'),

      // Active drivers count
      supabase
        .from('drivers')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', req.companyId)
        .eq('status', 'activ'),

      // Active trips (in progress)
      supabase
        .from('trips')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', req.companyId)
        .eq('status', 'in_progress'),

      // Trips this month
      supabase
        .from('trips')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', req.companyId)
        .gte('departure_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    ]);

    res.json({
      fleet: {
        trucks: trucksResult.count || 0,
        trailers: trailersResult.count || 0,
        drivers: driversResult.count || 0,
      },
      trips: {
        active: activeTripsResult.count || 0,
        thisMonth: thisMonthTripsResult.count || 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/dashboard/financial
 * Get financial overview for dashboard
 */
router.get('/financial', async (req, res, next) => {
  try {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const endOfMonth = new Date().toISOString();

    // Get this month's transactions
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('type, amount, currency')
      .eq('company_id', req.companyId)
      .gte('date', startOfMonth)
      .lte('date', endOfMonth);

    if (error) throw error;

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    res.json({
      period: {
        from: startOfMonth,
        to: endOfMonth,
        label: 'This Month',
      },
      income,
      expenses,
      balance: income - expenses,
      currency: 'EUR',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/dashboard/alerts
 * Get alerts and notifications for dashboard
 */
router.get('/alerts', async (req, res, next) => {
  try {
    const alerts = [];
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Documents expiring soon
    const { data: expiringDocs, error: docsError } = await supabase
      .from('documents')
      .select('id, doc_type, expiry_date, entity_type, entity_id')
      .eq('company_id', req.companyId)
      .not('expiry_date', 'is', null)
      .lte('expiry_date', thirtyDaysFromNow.toISOString())
      .gte('expiry_date', new Date().toISOString())
      .limit(10);

    if (!docsError && expiringDocs) {
      expiringDocs.forEach(doc => {
        const daysUntilExpiry = Math.ceil(
          (new Date(doc.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)
        );
        alerts.push({
          type: 'document_expiring',
          severity: daysUntilExpiry <= 7 ? 'high' : 'medium',
          message: `${doc.doc_type} expires in ${daysUntilExpiry} days`,
          entity_type: doc.entity_type,
          entity_id: doc.entity_id,
          date: doc.expiry_date,
        });
      });
    }

    // Driver licenses expiring
    const { data: expiringLicenses, error: licensesError } = await supabase
      .from('drivers')
      .select('id, first_name, last_name, license_expiry')
      .eq('company_id', req.companyId)
      .eq('status', 'activ')
      .not('license_expiry', 'is', null)
      .lte('license_expiry', thirtyDaysFromNow.toISOString())
      .gte('license_expiry', new Date().toISOString())
      .limit(10);

    if (!licensesError && expiringLicenses) {
      expiringLicenses.forEach(driver => {
        const daysUntilExpiry = Math.ceil(
          (new Date(driver.license_expiry) - new Date()) / (1000 * 60 * 60 * 24)
        );
        alerts.push({
          type: 'license_expiring',
          severity: daysUntilExpiry <= 7 ? 'high' : 'medium',
          message: `${driver.first_name} ${driver.last_name}'s license expires in ${daysUntilExpiry} days`,
          entity_type: 'driver',
          entity_id: driver.id,
          date: driver.license_expiry,
        });
      });
    }

    // Driver medical certificates expiring
    const { data: expiringMedicals, error: medicalsError } = await supabase
      .from('drivers')
      .select('id, first_name, last_name, medical_expiry')
      .eq('company_id', req.companyId)
      .eq('status', 'activ')
      .not('medical_expiry', 'is', null)
      .lte('medical_expiry', thirtyDaysFromNow.toISOString())
      .gte('medical_expiry', new Date().toISOString())
      .limit(10);

    if (!medicalsError && expiringMedicals) {
      expiringMedicals.forEach(driver => {
        const daysUntilExpiry = Math.ceil(
          (new Date(driver.medical_expiry) - new Date()) / (1000 * 60 * 60 * 24)
        );
        alerts.push({
          type: 'medical_expiring',
          severity: daysUntilExpiry <= 7 ? 'high' : 'medium',
          message: `${driver.first_name} ${driver.last_name}'s medical certificate expires in ${daysUntilExpiry} days`,
          entity_type: 'driver',
          entity_id: driver.id,
          date: driver.medical_expiry,
        });
      });
    }

    // Sort by severity and date
    alerts.sort((a, b) => {
      if (a.severity === 'high' && b.severity !== 'high') return -1;
      if (a.severity !== 'high' && b.severity === 'high') return 1;
      return new Date(a.date) - new Date(b.date);
    });

    res.json({
      total: alerts.length,
      alerts: alerts.slice(0, 20), // Limit to 20 alerts
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/dashboard/recent-trips
 * Get recent trips for dashboard
 */
router.get('/recent-trips', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        id,
        origin_city,
        origin_country,
        destination_city,
        destination_country,
        departure_date,
        status,
        driver:drivers(id, first_name, last_name),
        truck:truck_heads(id, registration_number)
      `)
      .eq('company_id', req.companyId)
      .order('departure_date', { ascending: false })
      .limit(10);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/dashboard/active-vehicles
 * Get currently active vehicles (on trips)
 */
router.get('/active-vehicles', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        id,
        destination_city,
        destination_country,
        truck:truck_heads(id, registration_number, brand, gps_device_id),
        driver:drivers(id, first_name, last_name, phone)
      `)
      .eq('company_id', req.companyId)
      .eq('status', 'in_progress');

    if (error) throw error;

    res.json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
