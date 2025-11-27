const axios = require('axios');
const { parseString } = require('xml2js');
const { promisify } = require('util');

const parseXml = promisify(parseString);

/**
 * BNR (Banca Națională a României) Exchange Rate Service
 * Provides real-time and historical exchange rates
 */

// Cache for exchange rates (key: date string, value: rates object)
const ratesCache = new Map();
const CACHE_TTL = 3600000; // 1 hour in milliseconds

// VAT rates per country (EU standard rates for fuel/services)
const VAT_RATES = {
  // EU Countries
  'RO': { rate: 19, name: 'Romania' },
  'BG': { rate: 20, name: 'Bulgaria' },
  'HU': { rate: 27, name: 'Hungary' },
  'AT': { rate: 20, name: 'Austria' },
  'DE': { rate: 19, name: 'Germany' },
  'PL': { rate: 23, name: 'Poland' },
  'CZ': { rate: 21, name: 'Czech Republic' },
  'SK': { rate: 20, name: 'Slovakia' },
  'SI': { rate: 22, name: 'Slovenia' },
  'HR': { rate: 25, name: 'Croatia' },
  'IT': { rate: 22, name: 'Italy' },
  'FR': { rate: 20, name: 'France' },
  'ES': { rate: 21, name: 'Spain' },
  'PT': { rate: 23, name: 'Portugal' },
  'BE': { rate: 21, name: 'Belgium' },
  'NL': { rate: 21, name: 'Netherlands' },
  'LU': { rate: 17, name: 'Luxembourg' },
  'GR': { rate: 24, name: 'Greece' },
  'IE': { rate: 23, name: 'Ireland' },
  'DK': { rate: 25, name: 'Denmark' },
  'SE': { rate: 25, name: 'Sweden' },
  'FI': { rate: 24, name: 'Finland' },
  'EE': { rate: 22, name: 'Estonia' },
  'LV': { rate: 21, name: 'Latvia' },
  'LT': { rate: 21, name: 'Lithuania' },
  'MT': { rate: 18, name: 'Malta' },
  'CY': { rate: 19, name: 'Cyprus' },
  // Non-EU (no VAT recovery)
  'RS': { rate: 20, name: 'Serbia', refundable: false },
  'UA': { rate: 20, name: 'Ukraine', refundable: false },
  'MD': { rate: 20, name: 'Moldova', refundable: false },
  'TR': { rate: 20, name: 'Turkey', refundable: false },
  'CH': { rate: 8.1, name: 'Switzerland', refundable: false },
  'GB': { rate: 20, name: 'United Kingdom', refundable: false },
  'NO': { rate: 25, name: 'Norway', refundable: false },
};

// Country to currency mapping
const COUNTRY_CURRENCY = {
  // Eurozone countries
  'AT': 'EUR', // Austria
  'BE': 'EUR', // Belgium
  'CY': 'EUR', // Cyprus
  'DE': 'EUR', // Germany
  'EE': 'EUR', // Estonia
  'ES': 'EUR', // Spain
  'FI': 'EUR', // Finland
  'FR': 'EUR', // France
  'GR': 'EUR', // Greece
  'IE': 'EUR', // Ireland
  'IT': 'EUR', // Italy
  'LT': 'EUR', // Lithuania
  'LU': 'EUR', // Luxembourg
  'LV': 'EUR', // Latvia
  'MT': 'EUR', // Malta
  'NL': 'EUR', // Netherlands
  'PT': 'EUR', // Portugal
  'SI': 'EUR', // Slovenia
  'SK': 'EUR', // Slovakia
  'HR': 'EUR', // Croatia (joined 2023)
  // Non-Eurozone EU
  'BG': 'BGN', // Bulgaria
  'CZ': 'CZK', // Czech Republic
  'DK': 'DKK', // Denmark
  'HU': 'HUF', // Hungary
  'PL': 'PLN', // Poland
  'RO': 'RON', // Romania
  'SE': 'SEK', // Sweden
  // Non-EU
  'CH': 'CHF', // Switzerland
  'GB': 'GBP', // United Kingdom
  'NO': 'NOK', // Norway
  'RS': 'RSD', // Serbia
  'UA': 'UAH', // Ukraine
  'MD': 'MDL', // Moldova
  'TR': 'TRY', // Turkey
};

// Country name to code mapping (for DKV reports which use full names)
const COUNTRY_NAME_TO_CODE = {
  'romania': 'RO',
  'ro': 'RO',
  'bulgaria': 'BG',
  'bg': 'BG',
  'hungary': 'HU',
  'hu': 'HU',
  'ungaria': 'HU',
  'austria': 'AT',
  'at': 'AT',
  'germany': 'DE',
  'de': 'DE',
  'germania': 'DE',
  'deutschland': 'DE',
  'poland': 'PL',
  'pl': 'PL',
  'polonia': 'PL',
  'czech republic': 'CZ',
  'czechia': 'CZ',
  'cz': 'CZ',
  'cehia': 'CZ',
  'slovakia': 'SK',
  'sk': 'SK',
  'slovacia': 'SK',
  'slovenia': 'SI',
  'si': 'SI',
  'croatia': 'HR',
  'hr': 'HR',
  'croatia': 'HR',
  'italy': 'IT',
  'it': 'IT',
  'italia': 'IT',
  'france': 'FR',
  'fr': 'FR',
  'franta': 'FR',
  'spain': 'ES',
  'es': 'ES',
  'spania': 'ES',
  'portugal': 'PT',
  'pt': 'PT',
  'belgium': 'BE',
  'be': 'BE',
  'belgia': 'BE',
  'netherlands': 'NL',
  'nl': 'NL',
  'olanda': 'NL',
  'luxembourg': 'LU',
  'lu': 'LU',
  'greece': 'GR',
  'gr': 'GR',
  'grecia': 'GR',
  'ireland': 'IE',
  'ie': 'IE',
  'irlanda': 'IE',
  'denmark': 'DK',
  'dk': 'DK',
  'danemarca': 'DK',
  'sweden': 'SE',
  'se': 'SE',
  'suedia': 'SE',
  'finland': 'FI',
  'fi': 'FI',
  'finlanda': 'FI',
  'estonia': 'EE',
  'ee': 'EE',
  'latvia': 'LV',
  'lv': 'LV',
  'lithuania': 'LT',
  'lt': 'LT',
  'lituania': 'LT',
  'malta': 'MT',
  'mt': 'MT',
  'cyprus': 'CY',
  'cy': 'CY',
  'cipru': 'CY',
  'serbia': 'RS',
  'rs': 'RS',
  'ukraine': 'UA',
  'ua': 'UA',
  'ucraina': 'UA',
  'moldova': 'MD',
  'md': 'MD',
  'turkey': 'TR',
  'tr': 'TR',
  'turcia': 'TR',
  'switzerland': 'CH',
  'ch': 'CH',
  'elvetia': 'CH',
  'united kingdom': 'GB',
  'uk': 'GB',
  'gb': 'GB',
  'norway': 'NO',
  'no': 'NO',
  'norvegia': 'NO',
};

/**
 * Get country code from country name or code
 * @param {string} country - Country name or code
 * @returns {string} ISO country code (2 letters)
 */
function getCountryCode(country) {
  if (!country) return null;
  const normalized = country.toLowerCase().trim();

  // Already a valid code
  if (normalized.length === 2 && VAT_RATES[normalized.toUpperCase()]) {
    return normalized.toUpperCase();
  }

  return COUNTRY_NAME_TO_CODE[normalized] || null;
}

/**
 * Get currency for a country
 * @param {string} country - Country name or code
 * @returns {string} Currency code (e.g., 'EUR', 'RON', 'HUF')
 */
function getCountryCurrency(country) {
  const code = getCountryCode(country);
  if (!code || !COUNTRY_CURRENCY[code]) {
    return 'EUR'; // Default to EUR if unknown
  }
  return COUNTRY_CURRENCY[code];
}

/**
 * Get VAT rate for a country
 * @param {string} country - Country name or code
 * @returns {Object} { rate: number, name: string, refundable: boolean }
 */
function getVatRate(country) {
  const code = getCountryCode(country);
  if (!code || !VAT_RATES[code]) {
    return { rate: 0, name: 'Unknown', refundable: false };
  }

  const info = VAT_RATES[code];
  return {
    rate: info.rate,
    name: info.name,
    code: code,
    refundable: info.refundable !== false, // Default to true for EU
  };
}

/**
 * Calculate VAT from gross and net amounts
 * @param {number} grossAmount - Gross amount (including VAT)
 * @param {number} netAmount - Net amount (excluding VAT)
 * @returns {Object} { vatAmount, vatRate, vatPercentage }
 */
function calculateVat(grossAmount, netAmount) {
  if (!grossAmount || !netAmount || grossAmount <= netAmount) {
    return { vatAmount: 0, vatRate: 0, vatPercentage: 0 };
  }

  const vatAmount = Math.round((grossAmount - netAmount) * 100) / 100;
  const vatPercentage = netAmount > 0
    ? Math.round((vatAmount / netAmount) * 10000) / 100
    : 0;

  return {
    vatAmount,
    vatRate: vatPercentage,
    vatPercentage,
  };
}

/**
 * Fetch current exchange rates from BNR
 * @returns {Object} Exchange rates with EUR as base { RON: rate, USD: rate, ... }
 */
async function fetchCurrentRates() {
  const cacheKey = 'current';
  const cached = ratesCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.rates;
  }

  try {
    const response = await axios.get('https://www.bnr.ro/nbrfxrates.xml', {
      timeout: 10000,
      headers: {
        'Accept': 'application/xml',
      },
    });

    const result = await parseXml(response.data);
    const rates = parseRatesFromXml(result);

    ratesCache.set(cacheKey, { rates, timestamp: Date.now() });

    return rates;
  } catch (error) {
    console.error('Error fetching BNR rates:', error.message);

    // Return cached rates if available (even if expired)
    if (cached) {
      console.log('Using cached BNR rates (expired)');
      return cached.rates;
    }

    // Return fallback rates if no cache available
    return getFallbackRates();
  }
}

/**
 * Fetch historical exchange rates from BNR for a specific date
 * @param {Date|string} date - Date to get rates for
 * @returns {Object} Exchange rates for that date
 */
async function fetchHistoricalRates(date) {
  const targetDate = date instanceof Date ? date : new Date(date);
  const year = targetDate.getFullYear();
  const dateStr = targetDate.toISOString().split('T')[0];

  const cacheKey = `historical_${dateStr}`;
  const cached = ratesCache.get(cacheKey);

  if (cached) {
    return cached.rates;
  }

  try {
    // BNR provides yearly XML files for historical data
    const url = `https://www.bnr.ro/files/xml/years/nbrfxrates${year}.xml`;

    const response = await axios.get(url, {
      timeout: 30000, // Longer timeout for larger files
      headers: {
        'Accept': 'application/xml',
      },
    });

    const result = await parseXml(response.data);
    const allRates = parseAllRatesFromYearlyXml(result);

    // Cache all rates from this year
    for (const [rateDate, rates] of Object.entries(allRates)) {
      ratesCache.set(`historical_${rateDate}`, { rates, timestamp: Date.now() });
    }

    // Find the closest date (BNR doesn't publish rates on weekends/holidays)
    const rates = findClosestRates(allRates, targetDate);

    return rates;
  } catch (error) {
    console.error(`Error fetching historical BNR rates for ${dateStr}:`, error.message);

    // Try to get current rates as fallback
    try {
      const currentRates = await fetchCurrentRates();
      return currentRates;
    } catch {
      return getFallbackRates();
    }
  }
}

/**
 * Parse rates from BNR daily XML response
 */
function parseRatesFromXml(result) {
  const rates = { EUR: 1 }; // Base currency

  try {
    const cube = result?.DataSet?.Body?.[0]?.Cube?.[0];
    if (!cube || !cube.Rate) {
      throw new Error('Invalid BNR XML structure');
    }

    for (const rate of cube.Rate) {
      const currency = rate.$.currency;
      let value = parseFloat(rate._);

      // Some currencies have multiplier attribute
      if (rate.$.multiplier) {
        value = value / parseInt(rate.$.multiplier);
      }

      rates[currency] = value;
    }
  } catch (error) {
    console.error('Error parsing BNR XML:', error.message);
    return getFallbackRates();
  }

  return rates;
}

/**
 * Parse all rates from BNR yearly XML file
 */
function parseAllRatesFromYearlyXml(result) {
  const allRates = {};

  try {
    const cubes = result?.DataSet?.Body?.[0]?.Cube || [];

    for (const cube of cubes) {
      const date = cube.$.date;
      const rates = { EUR: 1 };

      if (cube.Rate) {
        for (const rate of cube.Rate) {
          const currency = rate.$.currency;
          let value = parseFloat(rate._);

          if (rate.$.multiplier) {
            value = value / parseInt(rate.$.multiplier);
          }

          rates[currency] = value;
        }
      }

      allRates[date] = rates;
    }
  } catch (error) {
    console.error('Error parsing yearly BNR XML:', error.message);
  }

  return allRates;
}

/**
 * Find closest rates to target date (for weekends/holidays)
 */
function findClosestRates(allRates, targetDate) {
  const dateStr = targetDate.toISOString().split('T')[0];

  // Exact match
  if (allRates[dateStr]) {
    return allRates[dateStr];
  }

  // Find closest previous date
  const dates = Object.keys(allRates).sort();
  let closestDate = null;

  for (const date of dates) {
    if (date <= dateStr) {
      closestDate = date;
    } else {
      break;
    }
  }

  if (closestDate && allRates[closestDate]) {
    return allRates[closestDate];
  }

  // Return first available date if target is before all dates
  if (dates.length > 0 && allRates[dates[0]]) {
    return allRates[dates[0]];
  }

  return getFallbackRates();
}

/**
 * Get fallback exchange rates (approximate values)
 * Used when BNR API is unavailable
 */
function getFallbackRates() {
  console.warn('Using fallback exchange rates');
  return {
    EUR: 1,
    RON: 4.97, // Approximate RON/EUR rate
    USD: 0.92, // Approximate USD/EUR rate
    GBP: 1.17, // Approximate GBP/EUR rate
    CHF: 0.94, // Approximate CHF/EUR rate
    HUF: 0.0025, // Approximate HUF/EUR rate
    PLN: 0.23, // Approximate PLN/EUR rate
    CZK: 0.040, // Approximate CZK/EUR rate
    BGN: 0.51, // Approximate BGN/EUR rate (fixed 1.95583)
  };
}

/**
 * Convert amount from one currency to EUR
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {Date|string} date - Optional date for historical rates
 * @returns {Promise<Object>} { amountEur, rate, rateDate }
 */
async function convertToEur(amount, fromCurrency, date = null) {
  if (!amount || amount === 0) {
    return { amountEur: 0, rate: 1, rateDate: null };
  }

  const currency = (fromCurrency || 'EUR').toUpperCase().trim();

  // Already in EUR
  if (currency === 'EUR') {
    return { amountEur: amount, rate: 1, rateDate: null };
  }

  // Get rates
  const rates = date
    ? await fetchHistoricalRates(date)
    : await fetchCurrentRates();

  const rate = rates[currency];

  if (!rate) {
    console.warn(`No exchange rate found for ${currency}, using fallback`);
    const fallback = getFallbackRates();
    const fallbackRate = fallback[currency] || 1;
    return {
      amountEur: Math.round((amount / fallbackRate) * 100) / 100,
      rate: fallbackRate,
      rateDate: 'fallback',
    };
  }

  // BNR rates are quoted as RON per 1 unit of foreign currency
  // So to convert RON to EUR: RON_amount / RON_rate = EUR_amount
  const amountEur = Math.round((amount / rate) * 100) / 100;

  return {
    amountEur,
    rate,
    rateDate: date ? new Date(date).toISOString().split('T')[0] : 'current',
  };
}

/**
 * Convert amount from EUR to another currency
 * @param {number} amountEur - Amount in EUR
 * @param {string} toCurrency - Target currency code
 * @param {Date|string} date - Optional date for historical rates
 * @returns {Promise<Object>} { amount, rate, rateDate }
 */
async function convertFromEur(amountEur, toCurrency, date = null) {
  if (!amountEur || amountEur === 0) {
    return { amount: 0, rate: 1, rateDate: null };
  }

  const currency = (toCurrency || 'EUR').toUpperCase().trim();

  // Already in EUR
  if (currency === 'EUR') {
    return { amount: amountEur, rate: 1, rateDate: null };
  }

  const rates = date
    ? await fetchHistoricalRates(date)
    : await fetchCurrentRates();

  const rate = rates[currency];

  if (!rate) {
    console.warn(`No exchange rate found for ${currency}, using fallback`);
    const fallback = getFallbackRates();
    const fallbackRate = fallback[currency] || 1;
    return {
      amount: Math.round(amountEur * fallbackRate * 100) / 100,
      rate: fallbackRate,
      rateDate: 'fallback',
    };
  }

  const amount = Math.round(amountEur * rate * 100) / 100;

  return {
    amount,
    rate,
    rateDate: date ? new Date(date).toISOString().split('T')[0] : 'current',
  };
}

/**
 * Get all available VAT rates
 * @returns {Object} All VAT rates by country code
 */
function getAllVatRates() {
  return VAT_RATES;
}

/**
 * Clear the rates cache
 */
function clearCache() {
  ratesCache.clear();
}

module.exports = {
  fetchCurrentRates,
  fetchHistoricalRates,
  convertToEur,
  convertFromEur,
  getVatRate,
  getCountryCode,
  getCountryCurrency,
  calculateVat,
  getAllVatRates,
  clearCache,
  VAT_RATES,
  COUNTRY_NAME_TO_CODE,
  COUNTRY_CURRENCY,
};
