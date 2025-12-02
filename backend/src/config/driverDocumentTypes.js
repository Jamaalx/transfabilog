/**
 * Driver Document Types Configuration
 * Defines all document types for drivers with expiration rules and alert thresholds
 */

const DRIVER_DOCUMENT_TYPES = {
  // ============================================
  // DOCUMENTE OBLIGATORII PENTRU TOȚI ȘOFERII
  // ============================================

  // 1. Contract de muncă - OBLIGATORIU
  contract_munca: {
    name: 'Contract de muncă',
    category: 'hr',
    required: true,
    requiredCondition: null, // Obligatoriu pentru toți
    expires: false,
    defaultValidityMonths: null,
    alertDaysBefore: null,
    periodicReview: true,
    reviewIntervalMonths: 12,
    icon: 'FileText',
    description: 'Contract individual de muncă',
  },

  // 2. Carte de identitate - OBLIGATORIU
  carte_identitate: {
    name: 'Carte de identitate',
    category: 'hr',
    required: true,
    requiredCondition: null,
    expires: true,
    defaultValidityMonths: 120,
    alertDaysBefore: 90,
    periodicReview: false,
    icon: 'CreditCard',
    description: 'Buletin / CI',
  },

  // 3. Permis de conducere (C+E) - OBLIGATORIU
  permis_conducere: {
    name: 'Permis de conducere',
    category: 'hr',
    required: true,
    requiredCondition: null,
    expires: true,
    defaultValidityMonths: 60,
    alertDaysBefore: 90,
    periodicReview: false,
    icon: 'CreditCard',
    description: 'Permis de conducere categoriile C+E',
  },

  // 4. Card tahograf - OBLIGATORIU
  card_tahograf: {
    name: 'Card tahograf',
    category: 'hr',
    required: true,
    requiredCondition: null,
    expires: true,
    defaultValidityMonths: 60,
    alertDaysBefore: 60,
    periodicReview: false,
    icon: 'Clock',
    description: 'Card tahograf digital',
  },

  // 5. Atestat profesional (CPC) - OBLIGATORIU
  atestat_cpc: {
    name: 'Atestat profesional (CPC)',
    category: 'hr',
    required: true,
    requiredCondition: null,
    expires: true,
    defaultValidityMonths: 60,
    alertDaysBefore: 180,
    periodicReview: false,
    icon: 'Award',
    description: 'Certificat de competență profesională',
  },

  // 6. Aviz psihologic - OBLIGATORIU
  aviz_psihologic: {
    name: 'Aviz psihologic',
    category: 'hr',
    required: true,
    requiredCondition: null,
    expires: true,
    defaultValidityMonths: 60,
    alertDaysBefore: 60,
    periodicReview: false,
    icon: 'Brain',
    description: 'Aviz psihologic pentru conducători auto',
  },

  // 7. Fișă aptitudini (Medicina muncii) - OBLIGATORIU
  fisa_aptitudini: {
    name: 'Fișă aptitudini',
    category: 'hr',
    required: true,
    requiredCondition: null,
    expires: true,
    defaultValidityMonths: 12,
    alertDaysBefore: 30,
    periodicReview: false,
    icon: 'Heart',
    description: 'Fișă de aptitudini medicina muncii',
  },

  // 8. SSM - instruire introductivă - OBLIGATORIU (o singură dată)
  ssm_introductiv: {
    name: 'SSM - Instruire introductivă',
    category: 'hr',
    required: true,
    requiredCondition: null,
    expires: false,
    defaultValidityMonths: null,
    alertDaysBefore: null,
    periodicReview: false,
    oneTime: true,
    icon: 'Shield',
    description: 'Instruire introductivă SSM la angajare',
  },

  // 9. SSM - instruire periodică - OBLIGATORIU
  ssm_periodic: {
    name: 'SSM - Instruire periodică',
    category: 'hr',
    required: true,
    requiredCondition: null,
    expires: true,
    defaultValidityMonths: 6,
    alertDaysBefore: 14,
    periodicReview: false,
    icon: 'Shield',
    description: 'Instruire periodică securitate și sănătate în muncă',
  },

  // 10. PSI - instruire - OBLIGATORIU
  psi_instruire: {
    name: 'PSI - Instruire',
    category: 'hr',
    required: true,
    requiredCondition: null,
    expires: true,
    defaultValidityMonths: 6,
    alertDaysBefore: 14,
    periodicReview: false,
    icon: 'Flame',
    description: 'Instruire prevenire și stingere incendii',
  },

  // ============================================
  // DOCUMENTE RECOMANDATE (nu obligatorii legal)
  // ============================================

  // 11. Cazier judiciar - RECOMANDAT
  cazier_judiciar: {
    name: 'Cazier judiciar',
    category: 'hr',
    required: false,
    requiredCondition: null,
    recommended: true,
    expires: false,
    defaultValidityMonths: null,
    alertDaysBefore: null,
    periodicReview: true,
    reviewIntervalMonths: 12,
    icon: 'FileText',
    description: 'Cazier judiciar - reînnoire anuală recomandată',
  },

  // 12. Cazier auto - RECOMANDAT
  cazier_auto: {
    name: 'Cazier auto',
    category: 'hr',
    required: false,
    requiredCondition: null,
    recommended: true,
    expires: false,
    defaultValidityMonths: null,
    alertDaysBefore: null,
    periodicReview: true,
    reviewIntervalMonths: 12,
    icon: 'Car',
    description: 'Cazier auto (puncte penalizare) - reînnoire anuală recomandată',
  },

  // ============================================
  // DOCUMENTE CONDIȚIONATE (obligatorii doar în anumite condiții)
  // ============================================

  // 13. Pașaport - OBLIGATORIU doar pentru transport internațional
  pasaport: {
    name: 'Pașaport',
    category: 'hr',
    required: false,
    requiredCondition: 'international', // Obligatoriu pentru curse internaționale
    conditionalRequired: true,
    expires: true,
    defaultValidityMonths: 60,
    alertDaysBefore: 180,
    periodicReview: false,
    icon: 'BookOpen',
    description: 'Pașaport - obligatoriu pentru transport internațional',
  },

  // 14. Licență de transport / Copie conformă - OBLIGATORIU
  licenta_transport: {
    name: 'Copie conformă licență',
    category: 'hr',
    required: true,
    requiredCondition: null,
    expires: true,
    defaultValidityMonths: null,
    alertDaysBefore: 90,
    periodicReview: false,
    icon: 'FileCheck',
    description: 'Copie conformă a licenței de transport',
  },

  // 15. Certificat ADR - OBLIGATORIU doar pentru mărfuri periculoase
  certificat_adr: {
    name: 'Certificat ADR',
    category: 'hr',
    required: false,
    requiredCondition: 'adr', // Obligatoriu pentru transport ADR
    conditionalRequired: true,
    expires: true,
    defaultValidityMonths: 60,
    alertDaysBefore: 90,
    periodicReview: false,
    icon: 'AlertTriangle',
    description: 'Certificat ADR - obligatoriu pentru mărfuri periculoase',
  },

  // 16. Certificat FRIGO/ATP - OBLIGATORIU doar pentru transport frigorific
  certificat_frigo: {
    name: 'Certificat FRIGO/ATP',
    category: 'hr',
    required: false,
    requiredCondition: 'frigo', // Obligatoriu pentru transport frigorific
    conditionalRequired: true,
    expires: true,
    defaultValidityMonths: 60,
    alertDaysBefore: 90,
    periodicReview: false,
    icon: 'Thermometer',
    description: 'Certificat ATP - obligatoriu pentru transport mărfuri perisabile',
  },
};

/**
 * Alert status based on days until expiry
 * Returns color code and status text
 */
function getAlertStatus(daysUntilExpiry, docConfig) {
  // For documents that don't expire
  if (!docConfig.expires && !docConfig.periodicReview) {
    return {
      color: 'gray',
      status: 'no_expiry',
      label: 'Nu expiră',
      priority: 0,
    };
  }

  // For periodic review documents (like cazier)
  if (docConfig.periodicReview && daysUntilExpiry === null) {
    return {
      color: 'blue',
      status: 'review_recommended',
      label: 'Verificare recomandată',
      priority: 1,
    };
  }

  // Handle null/undefined expiry
  if (daysUntilExpiry === null || daysUntilExpiry === undefined) {
    return {
      color: 'gray',
      status: 'unknown',
      label: 'Dată necunoscută',
      priority: 0,
    };
  }

  // Expired
  if (daysUntilExpiry < 0) {
    return {
      color: 'red',
      status: 'expired',
      label: 'EXPIRAT',
      priority: 5,
      urgent: true,
    };
  }

  // Critical - under 7 days
  if (daysUntilExpiry <= 7) {
    return {
      color: 'red',
      status: 'critical',
      label: 'Critic',
      priority: 4,
      urgent: true,
    };
  }

  // Urgent - 7-30 days
  if (daysUntilExpiry <= 30) {
    return {
      color: 'orange',
      status: 'urgent',
      label: 'Urgent',
      priority: 3,
    };
  }

  // Warning - 30-90 days
  if (daysUntilExpiry <= 90) {
    return {
      color: 'yellow',
      status: 'warning',
      label: 'Atenție',
      priority: 2,
    };
  }

  // OK - more than 90 days
  return {
    color: 'green',
    status: 'ok',
    label: 'OK',
    priority: 0,
  };
}

/**
 * Calculate days until expiry from a date
 */
function calculateDaysUntilExpiry(expiryDate) {
  if (!expiryDate) return null;

  const expiry = new Date(expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Check if a document needs alert based on its type and expiry date
 */
function needsAlert(docType, expiryDate) {
  const config = DRIVER_DOCUMENT_TYPES[docType];
  if (!config) return false;

  const daysUntilExpiry = calculateDaysUntilExpiry(expiryDate);
  if (daysUntilExpiry === null) return false;

  // Check if within alert threshold
  if (config.alertDaysBefore && daysUntilExpiry <= config.alertDaysBefore) {
    return true;
  }

  // Already expired
  if (daysUntilExpiry < 0) {
    return true;
  }

  return false;
}

/**
 * Get all document types as array for frontend dropdown
 */
function getDocumentTypesForSelect() {
  return Object.entries(DRIVER_DOCUMENT_TYPES).map(([key, config]) => ({
    value: key,
    label: config.name,
    category: config.category,
    icon: config.icon,
    expires: config.expires,
    alertDaysBefore: config.alertDaysBefore,
  }));
}

/**
 * Get documents needing attention for a driver
 * Returns sorted by priority (most urgent first)
 */
function getDocumentAlerts(documents) {
  const alerts = [];

  for (const doc of documents) {
    const config = DRIVER_DOCUMENT_TYPES[doc.doc_type];
    if (!config) continue;

    const daysUntilExpiry = calculateDaysUntilExpiry(doc.expiry_date);
    const alertStatus = getAlertStatus(daysUntilExpiry, config);

    // Check if needs alert
    if (alertStatus.priority > 0 || needsAlert(doc.doc_type, doc.expiry_date)) {
      alerts.push({
        documentId: doc.id,
        documentType: doc.doc_type,
        documentName: config.name,
        expiryDate: doc.expiry_date,
        daysUntilExpiry,
        ...alertStatus,
      });
    }
  }

  // Sort by priority (highest first), then by days until expiry
  return alerts.sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    return (a.daysUntilExpiry || 999) - (b.daysUntilExpiry || 999);
  });
}

/**
 * Get missing required documents for a driver
 * @param {Array} existingDocuments - Documents the driver already has
 * @param {Object} driverProfile - Driver profile with flags like hasInternationalRoutes, hasADR, hasFrigo
 */
function getMissingDocuments(existingDocuments, driverProfile = {}) {
  const existingTypes = new Set(existingDocuments.map(d => d.doc_type));
  const missing = [];

  for (const [docType, config] of Object.entries(DRIVER_DOCUMENT_TYPES)) {
    // Skip if already has this document
    if (existingTypes.has(docType)) continue;

    // Check if required
    let isRequired = config.required;

    // Check conditional requirements
    if (config.conditionalRequired && config.requiredCondition) {
      switch (config.requiredCondition) {
        case 'international':
          isRequired = driverProfile.hasInternationalRoutes || false;
          break;
        case 'adr':
          isRequired = driverProfile.hasADR || false;
          break;
        case 'frigo':
          isRequired = driverProfile.hasFrigo || false;
          break;
      }
    }

    if (isRequired) {
      missing.push({
        docType,
        name: config.name,
        description: config.description,
        required: true,
        conditionalRequired: config.conditionalRequired || false,
        requiredCondition: config.requiredCondition,
        priority: config.conditionalRequired ? 'medium' : 'high',
      });
    } else if (config.recommended) {
      missing.push({
        docType,
        name: config.name,
        description: config.description,
        required: false,
        recommended: true,
        priority: 'low',
      });
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return missing.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

/**
 * Get complete driver document status
 * Returns overview of all documents, missing, expiring, etc.
 */
function getDriverDocumentStatus(documents, driverProfile = {}) {
  const status = {
    total: documents.length,
    valid: 0,
    expiring: 0,
    expired: 0,
    missing: [],
    alerts: [],
    byType: {},
  };

  // Process existing documents
  for (const doc of documents) {
    const config = DRIVER_DOCUMENT_TYPES[doc.doc_type];
    if (!config) continue;

    const daysUntilExpiry = calculateDaysUntilExpiry(doc.expiry_date);
    const alertStatus = getAlertStatus(daysUntilExpiry, config);

    status.byType[doc.doc_type] = {
      document: doc,
      config,
      daysUntilExpiry,
      alertStatus,
    };

    if (alertStatus.status === 'expired') {
      status.expired++;
    } else if (['critical', 'urgent', 'warning'].includes(alertStatus.status)) {
      status.expiring++;
    } else {
      status.valid++;
    }

    // Add to alerts if needed
    if (alertStatus.priority > 0) {
      status.alerts.push({
        documentId: doc.id,
        documentType: doc.doc_type,
        documentName: config.name,
        expiryDate: doc.expiry_date,
        daysUntilExpiry,
        ...alertStatus,
      });
    }
  }

  // Get missing documents
  status.missing = getMissingDocuments(documents, driverProfile);

  // Sort alerts by priority
  status.alerts.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return (a.daysUntilExpiry || 999) - (b.daysUntilExpiry || 999);
  });

  // Calculate compliance percentage
  const requiredCount = Object.values(DRIVER_DOCUMENT_TYPES).filter(c => c.required).length;
  const hasRequiredCount = documents.filter(d => {
    const config = DRIVER_DOCUMENT_TYPES[d.doc_type];
    return config?.required;
  }).length;
  status.compliancePercent = Math.round((hasRequiredCount / requiredCount) * 100);

  return status;
}

/**
 * Group document types by category for display
 */
function getDocumentTypesByCategory() {
  const categories = {
    obligatorii: {
      label: 'Obligatorii',
      description: 'Documente necesare pentru toți șoferii',
      types: [],
    },
    conditionate: {
      label: 'Condiționate',
      description: 'Obligatorii în funcție de tipul de transport',
      types: [],
    },
    recomandate: {
      label: 'Recomandate',
      description: 'Nu sunt obligatorii legal, dar sunt recomandate',
      types: [],
    },
  };

  for (const [key, config] of Object.entries(DRIVER_DOCUMENT_TYPES)) {
    const item = { value: key, ...config };

    if (config.required) {
      categories.obligatorii.types.push(item);
    } else if (config.conditionalRequired) {
      categories.conditionate.types.push(item);
    } else if (config.recommended) {
      categories.recomandate.types.push(item);
    }
  }

  return categories;
}

module.exports = {
  DRIVER_DOCUMENT_TYPES,
  getAlertStatus,
  calculateDaysUntilExpiry,
  needsAlert,
  getDocumentTypesForSelect,
  getDocumentAlerts,
  getMissingDocuments,
  getDriverDocumentStatus,
  getDocumentTypesByCategory,
};
