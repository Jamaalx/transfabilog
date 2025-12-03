/**
 * Vehicle Document Types Configuration
 * Defines all document types for trucks (cap tractor) and trailers (semiremorci)
 * with expiration rules and alert thresholds
 */

// =====================================================
// CAP TRACTOR - TRUCK DOCUMENTS (10 types)
// =====================================================
const TRUCK_DOCUMENT_TYPES = {
  // 1. Talon - nu expira
  talon_camion: {
    name: 'Talon înmatriculare',
    category: 'truck',
    required: true,
    expires: false,
    defaultValidityMonths: null,
    alertDaysBefore: null,
    icon: 'FileText',
    description: 'Certificat de înmatriculare camion',
  },

  // 2. ITP - 12 luni, alerta 30 zile
  itp_camion: {
    name: 'ITP Camion',
    category: 'truck',
    required: true,
    expires: true,
    defaultValidityMonths: 12,
    alertDaysBefore: 30,
    icon: 'ClipboardCheck',
    description: 'Inspecție Tehnică Periodică',
  },

  // 3. RCA - 6-12 luni, alerta 30 zile
  rca_camion: {
    name: 'RCA Camion',
    category: 'truck',
    required: true,
    expires: true,
    defaultValidityMonths: 12,
    alertDaysBefore: 30,
    icon: 'Shield',
    description: 'Asigurare obligatorie de răspundere civilă',
  },

  // 4. CASCO - 12 luni, alerta 30 zile
  casco_camion: {
    name: 'CASCO Camion',
    category: 'truck',
    required: false,
    recommended: true,
    expires: true,
    defaultValidityMonths: 12,
    alertDaysBefore: 30,
    icon: 'Shield',
    description: 'Asigurare facultativă CASCO',
  },

  // 5. Rovinieta - variabil, alerta 7 zile
  rovinieta_camion: {
    name: 'Rovinietă',
    category: 'truck',
    required: true,
    expires: true,
    defaultValidityMonths: 12, // variabil
    alertDaysBefore: 7,
    icon: 'Road',
    description: 'Taxă de utilizare drumuri naționale',
  },

  // 6. Copie conformă - anual, alerta 90 zile
  copie_conforma_camion: {
    name: 'Copie conformă licență',
    category: 'truck',
    required: true,
    expires: true,
    defaultValidityMonths: 12,
    alertDaysBefore: 90,
    icon: 'FileCheck',
    description: 'Copie conformă a licenței de transport',
  },

  // 7. Agreare tahograf - 2 ani, alerta 60 zile
  agreare_tahograf: {
    name: 'Agreare tahograf',
    category: 'truck',
    required: true,
    expires: true,
    defaultValidityMonths: 24,
    alertDaysBefore: 60,
    icon: 'Clock',
    description: 'Certificat agreare tahograf digital',
  },

  // 8. Verificare tahograf - 2 ani, alerta 60 zile
  verificare_tahograf: {
    name: 'Verificare tahograf',
    category: 'truck',
    required: true,
    expires: true,
    defaultValidityMonths: 24,
    alertDaysBefore: 60,
    icon: 'Clock',
    description: 'Verificare metrologică tahograf',
  },

  // 9. CMR (asigurare) - 12 luni, alerta 30 zile
  cmr_asigurare: {
    name: 'Asigurare CMR',
    category: 'truck',
    required: true,
    expires: true,
    defaultValidityMonths: 12,
    alertDaysBefore: 30,
    icon: 'FileText',
    description: 'Asigurare răspundere contractuală CMR',
  },

  // 10. Certificat ADR vehicul - 12 luni, alerta 60 zile
  certificat_adr_vehicul: {
    name: 'Certificat ADR Vehicul',
    category: 'truck',
    required: false,
    requiredCondition: 'adr',
    conditionalRequired: true,
    expires: true,
    defaultValidityMonths: 12,
    alertDaysBefore: 60,
    icon: 'AlertTriangle',
    description: 'Certificat ADR pentru transport mărfuri periculoase',
  },
};

// =====================================================
// SEMIREMORCĂ - TRAILER DOCUMENTS (5 types)
// =====================================================
const TRAILER_DOCUMENT_TYPES = {
  // 1. Talon - nu expira
  talon_remorca: {
    name: 'Talon înmatriculare',
    category: 'trailer',
    required: true,
    expires: false,
    defaultValidityMonths: null,
    alertDaysBefore: null,
    icon: 'FileText',
    description: 'Certificat de înmatriculare semiremorcă',
  },

  // 2. ITP - 12 luni, alerta 30 zile
  itp_remorca: {
    name: 'ITP Semiremorcă',
    category: 'trailer',
    required: true,
    expires: true,
    defaultValidityMonths: 12,
    alertDaysBefore: 30,
    icon: 'ClipboardCheck',
    description: 'Inspecție Tehnică Periodică semiremorcă',
  },

  // 3. RCA - 6-12 luni, alerta 30 zile
  rca_remorca: {
    name: 'RCA Semiremorcă',
    category: 'trailer',
    required: true,
    expires: true,
    defaultValidityMonths: 12,
    alertDaysBefore: 30,
    icon: 'Shield',
    description: 'Asigurare obligatorie semiremorcă',
  },

  // 4. Certificat ATP/FRIGO - 3-6 ani, alerta 90 zile
  certificat_atp_frigo: {
    name: 'Certificat ATP/FRIGO',
    category: 'trailer',
    required: false,
    requiredCondition: 'frigo',
    conditionalRequired: true,
    expires: true,
    defaultValidityMonths: 72, // 6 ani
    alertDaysBefore: 90,
    icon: 'Thermometer',
    description: 'Certificat ATP pentru transport mărfuri perisabile',
  },

  // 5. Certificat ADR remorca - 12 luni, alerta 60 zile
  certificat_adr_remorca: {
    name: 'Certificat ADR Remorcă',
    category: 'trailer',
    required: false,
    requiredCondition: 'adr',
    conditionalRequired: true,
    expires: true,
    defaultValidityMonths: 12,
    alertDaysBefore: 60,
    icon: 'AlertTriangle',
    description: 'Certificat ADR semiremorcă pentru mărfuri periculoase',
  },
};

// =====================================================
// DOCUMENTE INTERNAȚIONALE (4 types)
// =====================================================
const INTERNATIONAL_DOCUMENT_TYPES = {
  // 1. Carnet TIR - 12 luni, alerta 60 zile
  carnet_tir: {
    name: 'Carnet TIR',
    category: 'international',
    required: false,
    requiredCondition: 'international',
    conditionalRequired: true,
    expires: true,
    defaultValidityMonths: 12,
    alertDaysBefore: 60,
    icon: 'Globe',
    description: 'Carnet TIR pentru transport internațional',
  },

  // 2. Autorizații CEMT - variabil, per utilizare
  autorizatii_cemt: {
    name: 'Autorizații CEMT',
    category: 'international',
    required: false,
    requiredCondition: 'international',
    conditionalRequired: true,
    expires: true,
    defaultValidityMonths: 12,
    alertDaysBefore: 30,
    perUse: true,
    icon: 'FileCheck',
    description: 'Autorizații multilaterale CEMT',
  },

  // 3. Viniete străinătate - variabil, per cursă
  viniete_strainatate: {
    name: 'Viniete străinătate',
    category: 'international',
    required: false,
    requiredCondition: 'international',
    conditionalRequired: true,
    expires: true,
    defaultValidityMonths: null, // variabil
    alertDaysBefore: 7,
    perTrip: true,
    icon: 'Map',
    description: 'Viniete pentru drumuri din străinătate',
  },

  // 4. Carte Verde - 12 luni, alerta 30 zile
  carte_verde: {
    name: 'Carte Verde',
    category: 'international',
    required: false,
    requiredCondition: 'international',
    conditionalRequired: true,
    expires: true,
    defaultValidityMonths: 12,
    alertDaysBefore: 30,
    icon: 'CreditCard',
    description: 'Asigurare internațională Carte Verde',
  },
};

// Combined vehicle document types
const VEHICLE_DOCUMENT_TYPES = {
  ...TRUCK_DOCUMENT_TYPES,
  ...TRAILER_DOCUMENT_TYPES,
  ...INTERNATIONAL_DOCUMENT_TYPES,
};

/**
 * Alert status based on days until expiry
 */
function getAlertStatus(daysUntilExpiry, docConfig) {
  if (!docConfig.expires) {
    return {
      color: 'gray',
      status: 'no_expiry',
      label: 'Nu expiră',
      priority: 0,
    };
  }

  if (daysUntilExpiry === null || daysUntilExpiry === undefined) {
    return {
      color: 'gray',
      status: 'unknown',
      label: 'Dată necunoscută',
      priority: 0,
    };
  }

  if (daysUntilExpiry < 0) {
    return {
      color: 'red',
      status: 'expired',
      label: 'EXPIRAT',
      priority: 5,
      urgent: true,
    };
  }

  if (daysUntilExpiry <= 7) {
    return {
      color: 'red',
      status: 'critical',
      label: 'Critic',
      priority: 4,
      urgent: true,
    };
  }

  if (daysUntilExpiry <= 30) {
    return {
      color: 'orange',
      status: 'urgent',
      label: 'Urgent',
      priority: 3,
    };
  }

  if (daysUntilExpiry <= 90) {
    return {
      color: 'yellow',
      status: 'warning',
      label: 'Atenție',
      priority: 2,
    };
  }

  return {
    color: 'green',
    status: 'ok',
    label: 'OK',
    priority: 0,
  };
}

/**
 * Calculate days until expiry
 */
function calculateDaysUntilExpiry(expiryDate) {
  if (!expiryDate) return null;

  const expiry = new Date(expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get document types for frontend select (trucks)
 */
function getTruckDocumentTypesForSelect() {
  return Object.entries(TRUCK_DOCUMENT_TYPES).map(([key, config]) => ({
    value: key,
    label: config.name,
    category: 'truck',
    icon: config.icon,
    expires: config.expires,
    alertDaysBefore: config.alertDaysBefore,
  }));
}

/**
 * Get document types for frontend select (trailers)
 */
function getTrailerDocumentTypesForSelect() {
  return Object.entries(TRAILER_DOCUMENT_TYPES).map(([key, config]) => ({
    value: key,
    label: config.name,
    category: 'trailer',
    icon: config.icon,
    expires: config.expires,
    alertDaysBefore: config.alertDaysBefore,
  }));
}

/**
 * Get document types for frontend select (international)
 */
function getInternationalDocumentTypesForSelect() {
  return Object.entries(INTERNATIONAL_DOCUMENT_TYPES).map(([key, config]) => ({
    value: key,
    label: config.name,
    category: 'international',
    icon: config.icon,
    expires: config.expires,
    alertDaysBefore: config.alertDaysBefore,
  }));
}

/**
 * Get vehicle document status
 */
function getVehicleDocumentStatus(documents, vehicleProfile = {}) {
  const status = {
    total: documents.length,
    valid: 0,
    expiring: 0,
    expired: 0,
    missing: [],
    alerts: [],
    byType: {},
  };

  for (const doc of documents) {
    const config = VEHICLE_DOCUMENT_TYPES[doc.doc_type];
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

  // Sort alerts by priority
  status.alerts.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return (a.daysUntilExpiry || 999) - (b.daysUntilExpiry || 999);
  });

  return status;
}

/**
 * Get missing documents for a vehicle
 */
function getMissingVehicleDocuments(existingDocuments, vehicleType, vehicleProfile = {}) {
  const existingTypes = new Set(existingDocuments.map(d => d.doc_type));
  const missing = [];

  const docTypes = vehicleType === 'trailer' ? TRAILER_DOCUMENT_TYPES : TRUCK_DOCUMENT_TYPES;

  for (const [docType, config] of Object.entries(docTypes)) {
    if (existingTypes.has(docType)) continue;

    let isRequired = config.required;

    if (config.conditionalRequired && config.requiredCondition) {
      switch (config.requiredCondition) {
        case 'adr':
          isRequired = vehicleProfile.hasADR || false;
          break;
        case 'frigo':
          isRequired = vehicleProfile.hasFrigo || false;
          break;
        case 'international':
          isRequired = vehicleProfile.hasInternational || false;
          break;
      }
    }

    if (isRequired) {
      missing.push({
        docType,
        name: config.name,
        description: config.description,
        required: true,
        priority: 'high',
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

  return missing;
}

module.exports = {
  TRUCK_DOCUMENT_TYPES,
  TRAILER_DOCUMENT_TYPES,
  INTERNATIONAL_DOCUMENT_TYPES,
  VEHICLE_DOCUMENT_TYPES,
  getAlertStatus,
  calculateDaysUntilExpiry,
  getTruckDocumentTypesForSelect,
  getTrailerDocumentTypesForSelect,
  getInternationalDocumentTypesForSelect,
  getVehicleDocumentStatus,
  getMissingVehicleDocuments,
};
