const OpenAI = require('openai');
const { supabaseAdmin: supabase } = require('../config/supabase');
const path = require('path');
const xlsx = require('xlsx');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const { getDocument } = require('pdfjs-dist/legacy/build/pdf.mjs');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Document type definitions
const DOCUMENT_TYPES = {
  // Financial documents
  FACTURA_INTRARE: 'factura_intrare',
  FACTURA_IESIRE: 'factura_iesire',
  EXTRAS_BANCAR: 'extras_bancar',
  BON_FISCAL: 'bon_fiscal',

  // Fuel provider reports
  RAPORT_DKV: 'raport_dkv',
  RAPORT_EUROWAG: 'raport_eurowag',
  RAPORT_VERAG: 'raport_verag',
  RAPORT_SHELL: 'raport_shell',
  RAPORT_OMV: 'raport_omv',

  // Transport documents
  CMR: 'cmr',
  AVIZ_EXPEDITIE: 'aviz_expeditie',
  CONTRACT_TRANSPORT: 'contract_transport',

  // Fleet documents
  ASIGURARE: 'asigurare',
  ITP: 'itp',
  ROVINIETA: 'rovinieta',
  TAHOGRAF: 'tahograf',

  // HR documents - Basic
  CONTRACT_MUNCA: 'contract_munca',
  PERMIS_CONDUCERE: 'permis_conducere',
  ATESTAT: 'atestat',

  // HR documents - Extended (Driver Documents)
  CARTE_IDENTITATE: 'carte_identitate',
  PASAPORT: 'pasaport',
  CARD_TAHOGRAF: 'card_tahograf',
  ATESTAT_CPC: 'atestat_cpc',
  AVIZ_PSIHOLOGIC: 'aviz_psihologic',
  FISA_APTITUDINI: 'fisa_aptitudini',
  CAZIER_JUDICIAR: 'cazier_judiciar',
  CAZIER_AUTO: 'cazier_auto',
  SSM_INTRODUCTIV: 'ssm_introductiv',
  SSM_PERIODIC: 'ssm_periodic',
  PSI_INSTRUIRE: 'psi_instruire',
  LICENTA_TRANSPORT: 'licenta_transport',
  CERTIFICAT_ADR: 'certificat_adr',
  CERTIFICAT_FRIGO: 'certificat_frigo',

  // Other
  ALTELE: 'altele',
};

const DOCUMENT_CATEGORIES = {
  financial: ['factura_intrare', 'factura_iesire', 'extras_bancar', 'bon_fiscal'],
  fuel: ['raport_dkv', 'raport_eurowag', 'raport_verag', 'raport_shell', 'raport_omv'],
  transport: ['cmr', 'aviz_expeditie', 'contract_transport'],
  fleet: ['asigurare', 'itp', 'rovinieta', 'tahograf'],
  hr: [
    'contract_munca', 'permis_conducere', 'atestat', 'carte_identitate', 'pasaport',
    'card_tahograf', 'atestat_cpc', 'aviz_psihologic', 'fisa_aptitudini',
    'cazier_judiciar', 'cazier_auto', 'ssm_introductiv', 'ssm_periodic',
    'psi_instruire', 'licenta_transport', 'certificat_adr', 'certificat_frigo'
  ],
  other: ['altele'],
};

/**
 * Get MIME type category
 */
function getMimeCategory(mimeType) {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType === 'text/csv') return 'spreadsheet';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
  return 'unknown';
}

/**
 * Extract text from PDF using pdfjs-dist (more robust)
 */
async function extractTextWithPdfJs(fileBuffer) {
  try {
    const uint8Array = new Uint8Array(fileBuffer);
    const pdf = await getDocument({ data: uint8Array, useSystemFonts: true }).promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  } catch (error) {
    console.error('Error with pdfjs-dist:', error.message);
    throw error;
  }
}

/**
 * Extract text from PDF using pdf-parse library, with fallback to pdfjs-dist
 */
async function extractTextFromPDF(fileBuffer) {
  // First try with pdf-parse (faster for simple PDFs)
  try {
    const data = await pdfParse(fileBuffer);
    if (data.text && data.text.trim().length > 0) {
      return data.text;
    }
    throw new Error('PDF parsed but no text extracted');
  } catch (error) {
    console.error('Error extracting text from PDF with pdf-parse:', error.message);

    // Fallback to pdfjs-dist for problematic PDFs
    console.log('Falling back to pdfjs-dist for PDF extraction...');
    try {
      const text = await extractTextWithPdfJs(fileBuffer);
      if (text && text.trim().length > 0) {
        return text;
      }
      throw new Error('pdfjs-dist extracted no text');
    } catch (pdfjsError) {
      console.error('pdfjs-dist fallback also failed:', pdfjsError.message);
      throw new Error(`PDF extraction failed with both methods: ${error.message}`);
    }
  }
}

/**
 * Extract text from Excel (xlsx/xls) files
 */
function extractTextFromExcel(fileBuffer) {
  try {
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    let fullText = '';

    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const sheetText = xlsx.utils.sheet_to_csv(sheet, { FS: '\t', RS: '\n' });
      fullText += `--- Sheet: ${sheetName} ---\n${sheetText}\n\n`;
    });

    return fullText;
  } catch (error) {
    console.error('Error extracting text from Excel:', error);
    throw error;
  }
}

/**
 * Extract text from CSV files
 */
function extractTextFromCSV(fileBuffer) {
  try {
    // CSV is already text, just decode the buffer
    const text = fileBuffer.toString('utf-8');
    return text;
  } catch (error) {
    console.error('Error extracting text from CSV:', error);
    throw error;
  }
}

/**
 * Extract text from DOCX files using mammoth
 */
async function extractTextFromDOCX(fileBuffer) {
  try {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw error;
  }
}

/**
 * Extract text from image using AI Vision (for images only)
 */
async function extractTextFromImage(base64Image, mimeType) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Extrage TOT textul din această imagine/document. Include:
- Toate numerele, datele, sumele
- Nume de companii, persoane, adrese
- Numere de înmatriculare vehicule
- Orice text vizibil

Returnează textul exact așa cum apare, păstrând structura.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 4000,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw error;
  }
}

/**
 * Classify document type using AI
 */
async function classifyDocument(extractedText, fileName) {
  const systemPrompt = `Ești un expert în clasificarea documentelor pentru o companie de transport din România.
Analizează textul extras din document și clasifică-l într-una din categoriile:

TIPURI DOCUMENTE FINANCIARE:
- factura_intrare: Facturi primite de la furnizori
- factura_iesire: Facturi emise către clienți
- extras_bancar: Extrase de cont bancar
- bon_fiscal: Bonuri fiscale, chitanțe

RAPOARTE COMBUSTIBIL:
- raport_dkv: Rapoarte de alimentare DKV
- raport_eurowag: Rapoarte Eurowag
- raport_verag: Rapoarte Verag
- raport_shell: Rapoarte Shell
- raport_omv: Rapoarte OMV

DOCUMENTE TRANSPORT:
- cmr: Scrisori de transport internațional CMR
- aviz_expeditie: Avize de expediție
- contract_transport: Contracte de transport

DOCUMENTE FLOTĂ:
- asigurare: Polițe de asigurare (RCA, CASCO)
- itp: Certificate ITP / Inspecție tehnică
- rovinieta: Roviniete
- tahograf: Documente tahograf (atestate vehicul)

DOCUMENTE HR / ȘOFERI:
- contract_munca: Contracte de muncă
- carte_identitate: Buletin / Carte de identitate
- pasaport: Pașaport
- permis_conducere: Permise de conducere (cat. C, E, etc.)
- card_tahograf: Card tahograf digital (șofer)
- atestat_cpc: Atestat profesional CPC (Certificat Competență Profesională)
- aviz_psihologic: Aviz psihologic pentru conducători auto
- fisa_aptitudini: Fișă de aptitudini medicina muncii
- cazier_judiciar: Cazier judiciar
- cazier_auto: Cazier auto (istoric puncte penalizare)
- ssm_introductiv: Instruire SSM introductivă (fișă)
- ssm_periodic: Instruire SSM periodică (fișă)
- psi_instruire: Instruire PSI (prevenire incendii)
- licenta_transport: Copie conformă licență transport
- certificat_adr: Certificat ADR (mărfuri periculoase)
- certificat_frigo: Certificat FRIGO/ATP (transport frigorific)
- atestat: Alte atestate profesionale

ALTELE:
- altele: Alte documente neîncadrate

Răspunde DOAR cu un JSON valid.`;

  const userPrompt = `Nume fișier: ${fileName}

Text extras din document:
${extractedText.substring(0, 3000)}

Răspunde cu JSON:
{
  "document_type": "tipul_documentului",
  "document_category": "financial|fuel|transport|fleet|hr|other",
  "confidence": 0.95,
  "reasoning": "explicație scurtă"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error classifying document:', error);
    return {
      document_type: 'altele',
      document_category: 'other',
      confidence: 0,
      reasoning: 'Eroare la clasificare',
    };
  }
}

/**
 * Extract structured data from document
 */
async function extractStructuredData(extractedText, documentType, companyData) {
  const systemPrompt = `Ești un expert în extragerea datelor din documente pentru o companie de transport.
Extrage informațiile structurate din document și încearcă să le asociezi cu entitățile companiei.

CAMIOANE COMPANIE:
${companyData.trucks?.map(t => `- ${t.registration_number} (${t.brand} ${t.model})`).join('\n') || 'Nu există camioane înregistrate'}

ȘOFERI COMPANIE:
${companyData.drivers?.map(d => `- ${d.first_name} ${d.last_name}`).join('\n') || 'Nu există șoferi înregistrați'}

Returnează DOAR JSON valid.`;

  const extractionPrompts = {
    factura_intrare: `Extrage din această factură de intrare:
{
  "document_number": "număr factură",
  "document_date": "YYYY-MM-DD",
  "supplier_name": "nume furnizor",
  "supplier_cui": "CUI furnizor",
  "amount": număr,
  "currency": "RON|EUR",
  "vat_amount": număr sau null,
  "items": ["descriere articole"],
  "truck_registration": "nr înmatriculare dacă apare" sau null,
  "driver_name": "nume șofer dacă apare" sau null
}`,
    factura_iesire: `Extrage din această factură de ieșire (factură emisă către client pentru servicii de transport):
{
  "document_number": "număr factură",
  "document_date": "YYYY-MM-DD",
  "client_name": "nume client (destinatarul facturii)",
  "client_cui": "CUI/CIF client",
  "client_address": "adresa client" sau null,
  "amount": număr (valoare totală fără TVA),
  "amount_with_vat": număr (valoare totală cu TVA) sau null,
  "currency": "RON|EUR",
  "vat_amount": număr sau null,
  "vehicle_number": "număr înmatriculare camion menționat în factură" sau null,
  "driver_name": "nume șofer dacă apare" sau null,
  "items": ["descriere articole/servicii facturate"],
  "route": "rută transport (ex: București - Berlin)" sau null,
  "cmr_numbers": ["numere CMR referite în factură"] sau null,
  "transport_date": "YYYY-MM-DD data transportului" sau null
}
IMPORTANT: Caută numărul de înmatriculare al vehiculului - poate apărea în descrierea serviciilor, în detalii transport, sau în referințe.`,
    extras_bancar: `Extrage din acest extras bancar românesc toate tranzacțiile individuale.
FOARTE IMPORTANT: Acest extras poate avea MULTE PAGINI (1-50+). Trebuie să extragi TOATE tranzacțiile din TOATE paginile!

FORMAT EXTRAS BANCAR ROMÂNESC (Banca Transilvania, BRD, BCR, ING, Raiffeisen, etc.):
- Tabel cu coloane: Data | Descriere | Debit | Credit
- DEBIT = bani ieșiți din cont (plăți) - valori POZITIVE în coloana Debit
- CREDIT = bani intrați în cont (încasări) - valori POZITIVE în coloana Credit
- Dacă vezi valori NEGATIVE în coloana Debit (ex: -16.00), acestea sunt de fapt STORNĂRI/RETURNĂRI = credit
- "SOLD ANTERIOR" sau "SOLD INITIAL" = opening_balance
- "SOLD FINAL" sau "SOLD CURENT" = closing_balance
- "RULAJ ZI" = totaluri pe zi (ignoră, nu sunt tranzacții individuale)

Extrage și informațiile despre titular din antet:
- Nume companie (ex: "TRANSFABI LOG SRL")
- CUI companie (ex: "22366003")
- IBAN cont (ex: "RO90BTRLRONCRT0CN8810801")

{
  "document_date": "YYYY-MM-DD (data generării extrasului)",
  "document_number": "numărul extrasului dacă există",
  "bank_name": "nume bancă (BANCA TRANSILVANIA, BRD, BCR, etc.)",
  "account_holder": "numele companiei titulare a contului",
  "account_holder_cui": "CUI-ul companiei titulare",
  "account_number": "IBAN complet",
  "period_start": "YYYY-MM-DD",
  "period_end": "YYYY-MM-DD",
  "opening_balance": număr (SOLD ANTERIOR/INITIAL),
  "closing_balance": număr (SOLD FINAL),
  "currency": "RON|EUR",
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "type": "credit" sau "debit",
      "amount": număr pozitiv (valoarea absolută),
      "description": "descrierea completă a tranzacției",
      "reference": "REF: xxx dacă există",
      "counterparty": "numele beneficiarului sau plătitorului",
      "counterparty_iban": "IBAN contrapartidă dacă apare în descriere",
      "ai_category": "categoria sugerată",
      "ai_category_confidence": număr între 0 și 1
    }
  ]
}

REGULI PENTRU PARSARE:
1. Fiecare rând cu dată reprezintă o tranzacție
2. Dacă valoarea e în coloana Debit (sau apare fără semn/cu semn pozitiv în stânga) = type: "debit"
3. Dacă valoarea e în coloana Credit (sau apare în dreapta) = type: "credit"
4. Dacă vezi valori NEGATIVE în Debit (ex: -16.00) = type: "credit" (stornare)
5. NU include rândurile "RULAJ ZI", "SOLD FINAL ZI" - acestea NU sunt tranzacții
6. Extrage REF: din descriere ca reference
7. Extrage numele companiei/persoanei din descriere ca counterparty

CATEGORII PENTRU DEBIT (plăți):
- "combustibil" - SHELL, OMV, MOL, PETROM, benzinărie
- "taxa_drum" - roviniete, vignete, HU-GO, GO-BOX, Toll
- "parcare" - parking, parcare
- "amenzi" - amendă, poliție, sancțiune
- "reparatii" - service, piese, vulcanizare, ITP
- "asigurare" - RCA, CASCO, asigurare
- "diurna" - diurnă, avans șofer
- "salariu" - salariu, plată angajat
- "furnizori" - plată factură, furnizor
- "leasing" - leasing, rată
- "utilitati" - curent, gaz, telefon, internet
- "chirie" - chirie
- "taxe_stat" - impozit, ANAF, contribuții
- "bancar" - comision, dobândă bancară, Pachet IZI, comision ATM, comision procesare
- "numerar" - retragere numerar, ATM
- "transfer_intern" - transfer între conturi proprii
- "altele" - alte plăți

CATEGORII PENTRU CREDIT (încasări):
- "incasare_client" - plată de la client, încasare
- "schimb_valutar" - schimb valutar
- "transfer_intern" - transfer între conturi proprii
- "rambursare" - stornare, rambursare
- "altele" - alte încasări

EXEMPLE DIN EXTRASUL BANCA TRANSILVANIA:
- "Retragere de numerar de la ATM BT" cu 4,000.00 în Debit → type: "debit", category: "numerar"
- "Comision procesare ridicare numerar" cu 16.00 în Debit → type: "debit", category: "bancar"
- "Comision retragere ATM" cu -16.00 în Debit → type: "credit", category: "bancar" (stornare!)
- "Transfer intern - canal electronic" în Credit → type: "credit", category: "transfer_intern"
- "Plata OP intra - canal electronic" cu beneficiar CABINET AVOCATURA → type: "debit", category: "furnizori"
- "Schimb valutar - canal electronic" în Credit → type: "credit", category: "schimb_valutar"
- "Pachet IZI Nelimitat All Inclusive" → type: "debit", category: "bancar"`,
    bon_fiscal: `Extrage din acest bon fiscal:
{
  "document_number": "număr bon",
  "document_date": "YYYY-MM-DD",
  "supplier_name": "nume firmă/magazin emitent",
  "supplier_cui": "CUI/CIF firmă emitentă",
  "amount": număr total,
  "currency": "RON|EUR",
  "vat_amount": TVA dacă apare,
  "items": ["produse/servicii cumpărate"],
  "truck_registration": "nr înmatriculare dacă apare" sau null
}`,
    raport_dkv: `Extrage din acest raport DKV:
{
  "document_number": "număr factură/raport",
  "document_date": "YYYY-MM-DD",
  "supplier_name": "DKV Euro Service GmbH + Co. KG" sau numele firmei DKV din document,
  "supplier_cui": "CUI/VAT ID al DKV din document",
  "period_start": "YYYY-MM-DD",
  "period_end": "YYYY-MM-DD",
  "total_amount": număr,
  "currency": "EUR",
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "truck_registration": "nr înmatriculare",
      "location": "locație",
      "fuel_liters": număr,
      "amount": număr,
      "type": "diesel|adblue|taxa|altele"
    }
  ]
}`,
    raport_eurowag: `Extrage din acest raport Eurowag:
{
  "document_number": "număr factură/raport",
  "document_date": "YYYY-MM-DD",
  "supplier_name": "EUROWAG sau W.A.G. payment solutions" sau numele firmei din document,
  "supplier_cui": "CUI/VAT ID din document",
  "period_start": "YYYY-MM-DD",
  "period_end": "YYYY-MM-DD",
  "total_amount": număr,
  "currency": "EUR",
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "truck_registration": "nr înmatriculare",
      "location": "locație/țară",
      "fuel_liters": număr sau null,
      "amount": număr,
      "type": "diesel|taxa_drum|parcare|altele"
    }
  ]
}`,
    raport_verag: `Extrage din acest raport Verag:
{
  "document_number": "număr factură/raport",
  "document_date": "YYYY-MM-DD",
  "supplier_name": "numele firmei Verag din document",
  "supplier_cui": "CUI/VAT ID din document",
  "period_start": "YYYY-MM-DD",
  "period_end": "YYYY-MM-DD",
  "total_amount": număr,
  "currency": "EUR",
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "truck_registration": "nr înmatriculare",
      "location": "locație",
      "fuel_liters": număr sau null,
      "amount": număr,
      "type": "diesel|adblue|taxa|altele"
    }
  ]
}`,
    raport_shell: `Extrage din acest raport Shell:
{
  "document_number": "număr factură/raport",
  "document_date": "YYYY-MM-DD",
  "supplier_name": "Shell sau numele complet din document",
  "supplier_cui": "CUI/VAT ID din document",
  "period_start": "YYYY-MM-DD",
  "period_end": "YYYY-MM-DD",
  "total_amount": număr,
  "currency": "EUR",
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "truck_registration": "nr înmatriculare",
      "location": "locație",
      "fuel_liters": număr sau null,
      "amount": număr,
      "type": "diesel|adblue|altele"
    }
  ]
}`,
    raport_omv: `Extrage din acest raport OMV:
{
  "document_number": "număr factură/raport",
  "document_date": "YYYY-MM-DD",
  "supplier_name": "OMV sau numele complet din document",
  "supplier_cui": "CUI/VAT ID din document",
  "period_start": "YYYY-MM-DD",
  "period_end": "YYYY-MM-DD",
  "total_amount": număr,
  "currency": "EUR",
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "truck_registration": "nr înmatriculare",
      "location": "locație",
      "fuel_liters": număr sau null,
      "amount": număr,
      "type": "diesel|adblue|altele"
    }
  ]
}`,
    cmr: `Extrage din acest CMR:
{
  "document_number": "număr CMR",
  "document_date": "YYYY-MM-DD",
  "sender_name": "expeditor",
  "sender_address": "adresă expeditor",
  "recipient_name": "destinatar",
  "recipient_address": "adresă destinatar",
  "loading_place": "loc încărcare",
  "delivery_place": "loc livrare",
  "cargo_description": "descriere marfă",
  "cargo_weight": număr în kg,
  "truck_registration": "nr înmatriculare",
  "trailer_registration": "nr remorcă" sau null,
  "driver_name": "nume șofer"
}`,

    // ============================================
    // DOCUMENTE HR / ȘOFERI - Extraction Prompts
    // ============================================

    carte_identitate: `Extrage din această carte de identitate / buletin:
{
  "document_number": "seria și numărul (ex: RX123456)",
  "cnp": "CNP (13 cifre)",
  "first_name": "prenume",
  "last_name": "nume",
  "birth_date": "YYYY-MM-DD",
  "birth_place": "locul nașterii",
  "address": "adresa completă",
  "issue_date": "YYYY-MM-DD data eliberării",
  "expiry_date": "YYYY-MM-DD data expirării",
  "issuing_authority": "emitent (ex: SPCLEP Sector 1)"
}`,

    pasaport: `Extrage din acest pașaport:
{
  "document_number": "număr pașaport",
  "cnp": "CNP dacă apare",
  "first_name": "prenume",
  "last_name": "nume",
  "birth_date": "YYYY-MM-DD",
  "birth_place": "locul nașterii",
  "nationality": "cetățenie",
  "sex": "M sau F",
  "issue_date": "YYYY-MM-DD data eliberării",
  "expiry_date": "YYYY-MM-DD data expirării",
  "issuing_authority": "autoritatea emitentă"
}`,

    permis_conducere: `Extrage din acest permis de conducere:
{
  "document_number": "număr permis",
  "cnp": "CNP",
  "first_name": "prenume",
  "last_name": "nume",
  "birth_date": "YYYY-MM-DD",
  "birth_place": "locul nașterii",
  "categories": ["categoriile de pe permis: AM, A1, A2, A, B, C, CE, D, etc."],
  "issue_date": "YYYY-MM-DD data eliberării",
  "expiry_date": "YYYY-MM-DD data expirării (a celei mai recente categorii)",
  "category_dates": {"C": "YYYY-MM-DD", "CE": "YYYY-MM-DD"} sau null,
  "issuing_authority": "autoritatea emitentă",
  "restrictions": "restricții dacă există" sau null
}`,

    card_tahograf: `Extrage din acest card tahograf:
{
  "document_number": "număr card",
  "card_type": "CONDUCĂTOR sau COMPANIE sau ATELIER",
  "first_name": "prenume",
  "last_name": "nume",
  "birth_date": "YYYY-MM-DD",
  "issue_date": "YYYY-MM-DD data eliberării",
  "expiry_date": "YYYY-MM-DD data expirării",
  "issuing_country": "țara emitentă (RO, etc.)",
  "issuing_authority": "autoritatea emitentă"
}`,

    atestat_cpc: `Extrage din acest atestat CPC (Certificat Competență Profesională):
{
  "document_number": "număr atestat/certificat",
  "first_name": "prenume",
  "last_name": "nume",
  "cnp": "CNP dacă apare",
  "certificate_type": "marfă sau persoane",
  "issue_date": "YYYY-MM-DD data eliberării",
  "expiry_date": "YYYY-MM-DD data expirării",
  "issuing_authority": "autoritatea emitentă (ARR, etc.)",
  "training_hours": număr ore pregătire dacă apare sau null
}`,

    aviz_psihologic: `Extrage din acest aviz psihologic:
{
  "document_number": "număr aviz",
  "first_name": "prenume",
  "last_name": "nume",
  "cnp": "CNP",
  "result": "APT sau INAPT",
  "purpose": "scopul avizului (conducător auto, etc.)",
  "issue_date": "YYYY-MM-DD data eliberării",
  "expiry_date": "YYYY-MM-DD data expirării",
  "psychologist_name": "numele psihologului",
  "clinic_name": "denumirea clinicii/cabinetului"
}`,

    fisa_aptitudini: `Extrage din această fișă de aptitudini / medicina muncii:
{
  "document_number": "număr fișă" sau null,
  "first_name": "prenume",
  "last_name": "nume",
  "cnp": "CNP",
  "result": "APT sau INAPT sau APT CONDIȚIONAT",
  "job_position": "funcția/postul (șofer, etc.)",
  "issue_date": "YYYY-MM-DD data examinării",
  "expiry_date": "YYYY-MM-DD următoarea examinare",
  "validity_months": număr luni valabilitate sau null,
  "doctor_name": "numele medicului",
  "clinic_name": "denumirea clinicii/cabinetului",
  "restrictions": "restricții medicale" sau null
}`,

    cazier_judiciar: `Extrage din acest cazier judiciar:
{
  "document_number": "număr certificat",
  "first_name": "prenume",
  "last_name": "nume",
  "cnp": "CNP",
  "father_name": "prenume tată",
  "mother_name": "prenume mamă",
  "birth_date": "YYYY-MM-DD",
  "birth_place": "locul nașterii",
  "result": "fără antecedente sau cu antecedente",
  "issue_date": "YYYY-MM-DD data eliberării",
  "issuing_authority": "autoritatea emitentă"
}`,

    cazier_auto: `Extrage din acest cazier auto / fișă de evidență:
{
  "document_number": "număr document",
  "first_name": "prenume",
  "last_name": "nume",
  "cnp": "CNP",
  "license_number": "număr permis conducere",
  "total_points": număr puncte penalizare sau 0,
  "issue_date": "YYYY-MM-DD data eliberării",
  "incidents": ["lista incidente/abateri"] sau [],
  "issuing_authority": "autoritatea emitentă"
}`,

    ssm_introductiv: `Extrage din această fișă de instruire SSM introductivă:
{
  "document_number": "număr fișă" sau null,
  "first_name": "prenume angajat",
  "last_name": "nume angajat",
  "cnp": "CNP",
  "job_position": "funcția",
  "training_date": "YYYY-MM-DD data instruirii",
  "trainer_name": "numele persoanei care a efectuat instruirea",
  "duration_hours": număr ore sau null,
  "company_name": "denumirea firmei"
}`,

    ssm_periodic: `Extrage din această fișă de instruire SSM periodică:
{
  "document_number": "număr fișă" sau null,
  "first_name": "prenume angajat",
  "last_name": "nume angajat",
  "cnp": "CNP",
  "job_position": "funcția",
  "training_date": "YYYY-MM-DD data instruirii",
  "expiry_date": "YYYY-MM-DD următoarea instruire (6 luni de la training_date)",
  "trainer_name": "numele persoanei care a efectuat instruirea",
  "topics": ["teme abordate"] sau null,
  "company_name": "denumirea firmei"
}`,

    psi_instruire: `Extrage din această fișă de instruire PSI:
{
  "document_number": "număr fișă" sau null,
  "first_name": "prenume angajat",
  "last_name": "nume angajat",
  "cnp": "CNP",
  "job_position": "funcția",
  "training_date": "YYYY-MM-DD data instruirii",
  "expiry_date": "YYYY-MM-DD următoarea instruire",
  "trainer_name": "numele persoanei care a efectuat instruirea",
  "company_name": "denumirea firmei"
}`,

    licenta_transport: `Extrage din această copie conformă / licență de transport:
{
  "document_number": "număr licență/copie conformă",
  "company_name": "denumirea firmei titulare",
  "company_cui": "CUI firmă",
  "transport_type": "marfă sau persoane",
  "vehicle_registration": "număr înmatriculare vehicul" sau null,
  "issue_date": "YYYY-MM-DD data eliberării",
  "expiry_date": "YYYY-MM-DD data expirării",
  "issuing_authority": "autoritatea emitentă (ARR)"
}`,

    certificat_adr: `Extrage din acest certificat ADR:
{
  "document_number": "număr certificat",
  "first_name": "prenume",
  "last_name": "nume",
  "birth_date": "YYYY-MM-DD",
  "adr_classes": ["clasele ADR: 1, 2, 3, 4.1, 4.2, 4.3, 5.1, 5.2, 6.1, 6.2, 7, 8, 9"] sau [],
  "specializations": ["cisterne, explozivi, radioactive"] sau [],
  "issue_date": "YYYY-MM-DD data eliberării",
  "expiry_date": "YYYY-MM-DD data expirării",
  "issuing_country": "țara emitentă",
  "issuing_authority": "autoritatea emitentă"
}`,

    certificat_frigo: `Extrage din acest certificat ATP/FRIGO:
{
  "document_number": "număr certificat",
  "vehicle_registration": "număr înmatriculare vehicul",
  "vehicle_type": "tip vehicul (semiremorcă, camion, etc.)",
  "atp_class": "clasa ATP (FRC, FNA, etc.)",
  "temperature_range": "interval temperatură (ex: -20°C la +12°C)",
  "issue_date": "YYYY-MM-DD data eliberării",
  "expiry_date": "YYYY-MM-DD data expirării",
  "issuing_authority": "autoritatea emitentă (RAR)"
}`,

    default: `Extrage informațiile relevante:
{
  "document_number": "număr document dacă există",
  "document_date": "YYYY-MM-DD",
  "supplier_name": "nume firmă emitentă/furnizor dacă apare",
  "supplier_cui": "CUI/CIF firmă emitentă dacă apare",
  "amount": număr sau null,
  "currency": "RON|EUR" sau null,
  "description": "descriere conținut",
  "truck_registration": "nr înmatriculare dacă apare" sau null,
  "driver_name": "nume șofer dacă apare" sau null,
  "other_entities": ["alte entități menționate"]
}`,
  };

  const prompt = extractionPrompts[documentType] || extractionPrompts.default;

  // Bank statements and fuel reports need more text to capture all transactions
  const isMultiPageDocument = ['extras_bancar', 'raport_dkv', 'raport_eurowag', 'raport_verag', 'raport_shell', 'raport_omv'].includes(documentType);
  const textLimit = isMultiPageDocument ? 50000 : 8000;
  const model = isMultiPageDocument ? 'gpt-4o' : 'gpt-4o-mini';

  try {
    console.log(`[DocumentProcessing] Extracting from ${documentType} using ${model}, text length: ${extractedText.length}, limit: ${textLimit}`);

    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `${prompt}\n\nText document:\n${extractedText.substring(0, textLimit)}` },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
      max_tokens: isMultiPageDocument ? 16000 : 4000,
    });

    const responseContent = response.choices[0].message.content;
    console.log(`[DocumentProcessing] Raw AI response length: ${responseContent?.length || 0}`);

    // Log first 500 chars of response for debugging
    if (documentType === 'extras_bancar') {
      console.log(`[DocumentProcessing] AI response preview: ${responseContent?.substring(0, 500)}...`);
    }

    if (!responseContent) {
      console.error('[DocumentProcessing] AI returned empty response');
      return null;
    }

    const result = JSON.parse(responseContent);
    console.log(`[DocumentProcessing] Extracted ${result.transactions?.length || 0} transactions from ${documentType}`);
    console.log(`[DocumentProcessing] Extracted fields: bank_name=${result.bank_name}, account_holder=${result.account_holder}, period_start=${result.period_start}`);

    // Additional detailed logging for bank statements
    if (documentType === 'extras_bancar') {
      console.log(`[DocumentProcessing] Bank statement details: opening_balance=${result.opening_balance}, closing_balance=${result.closing_balance}, currency=${result.currency}`);
      console.log(`[DocumentProcessing] Bank statement result keys: ${Object.keys(result).join(', ')}`);
    }

    return result;
  } catch (error) {
    console.error('[DocumentProcessing] Error extracting structured data:', error.message);
    console.error('[DocumentProcessing] Error details:', error.response?.data || error.code || 'No additional details');
    return null;
  }
}

/**
 * Find a trip that was active on a specific date for a truck or driver
 * @param {string} companyId - Company ID
 * @param {string} documentDate - Date in YYYY-MM-DD format
 * @param {string|null} truckId - Truck ID (optional)
 * @param {string|null} driverId - Driver ID (optional)
 * @returns {Promise<string|null>} Trip ID if found
 */
async function findMatchingTrip(companyId, documentDate, truckId, driverId) {
  if (!documentDate || (!truckId && !driverId)) {
    return null;
  }

  try {
    // Build query to find trips that were active on the document date
    let query = supabase
      .from('trips')
      .select('id, departure_date, actual_arrival, estimated_arrival, status')
      .eq('company_id', companyId)
      .in('status', ['in_progress', 'finalizat']) // Only active or completed trips
      .lte('departure_date', documentDate); // Trip started before or on document date

    // Match by truck OR driver
    if (truckId && driverId) {
      query = query.or(`truck_id.eq.${truckId},driver_id.eq.${driverId}`);
    } else if (truckId) {
      query = query.eq('truck_id', truckId);
    } else if (driverId) {
      query = query.eq('driver_id', driverId);
    }

    const { data: trips, error } = await query;

    if (error || !trips || trips.length === 0) {
      return null;
    }

    // Filter trips where document date is within trip period
    const docDate = new Date(documentDate);

    const matchingTrip = trips.find(trip => {
      const departureDate = new Date(trip.departure_date);

      // Document date must be after or on departure
      if (docDate < departureDate) return false;

      // If trip has actual_arrival, check against that
      if (trip.actual_arrival) {
        const arrivalDate = new Date(trip.actual_arrival);
        // Give 1 day buffer after arrival for expenses that come in late
        arrivalDate.setDate(arrivalDate.getDate() + 1);
        return docDate <= arrivalDate;
      }

      // If trip has estimated_arrival but no actual, use estimated + buffer
      if (trip.estimated_arrival) {
        const estimatedDate = new Date(trip.estimated_arrival);
        // Give 3 days buffer for estimated arrivals
        estimatedDate.setDate(estimatedDate.getDate() + 3);
        return docDate <= estimatedDate;
      }

      // If trip is in_progress with no arrival date, assume it's still active
      if (trip.status === 'in_progress') {
        return true;
      }

      return false;
    });

    if (matchingTrip) {
      console.log(`Auto-matched document to trip ${matchingTrip.id} based on date ${documentDate}`);
      return matchingTrip.id;
    }

    return null;
  } catch (error) {
    console.error('Error finding matching trip:', error);
    return null;
  }
}

/**
 * Match extracted data to company entities
 * NOTE: driver_id is NOT saved to document - driver comes from the trip relationship
 */
async function matchToEntities(extractedData, companyId) {
  const matches = {
    truck_id: null,
    trailer_id: null,
    // driver_id removed - driver association comes from trip, not document
    trip_id: null,
  };

  if (!extractedData) return matches;

  // Match truck by registration number
  if (extractedData.truck_registration) {
    const normalizedReg = extractedData.truck_registration.replace(/\s/g, '').toUpperCase();
    const { data: truck } = await supabase
      .from('truck_heads')
      .select('id')
      .eq('company_id', companyId)
      .ilike('registration_number', `%${normalizedReg}%`)
      .single();

    if (truck) matches.truck_id = truck.id;
  }

  // Match trailer by registration
  if (extractedData.trailer_registration) {
    const normalizedReg = extractedData.trailer_registration.replace(/\s/g, '').toUpperCase();
    const { data: trailer } = await supabase
      .from('trailers')
      .select('id')
      .eq('company_id', companyId)
      .ilike('registration_number', `%${normalizedReg}%`)
      .single();

    if (trailer) matches.trailer_id = trailer.id;
  }

  // Match driver by name - only used for finding trip, NOT saved to document
  let tempDriverId = null;
  if (extractedData.driver_name) {
    const nameParts = extractedData.driver_name.split(' ');
    const { data: drivers } = await supabase
      .from('drivers')
      .select('id, first_name, last_name')
      .eq('company_id', companyId);

    if (drivers) {
      const matchedDriver = drivers.find(d => {
        const fullName = `${d.first_name} ${d.last_name}`.toLowerCase();
        return nameParts.some(part => fullName.includes(part.toLowerCase()));
      });
      if (matchedDriver) tempDriverId = matchedDriver.id;
    }
  }

  // Auto-match trip based on document date and truck/driver
  // Driver is used to find trip but NOT saved directly to document
  const documentDate = extractedData.document_date || extractedData.date;
  if (documentDate && (matches.truck_id || tempDriverId)) {
    matches.trip_id = await findMatchingTrip(companyId, documentDate, matches.truck_id, tempDriverId);
  }

  return matches;
}

/**
 * Process a single uploaded document
 */
async function processDocument(documentId, companyId, fileBuffer, fileName, mimeType) {
  const startTime = Date.now();

  try {
    // Get existing document data to preserve metadata (like bank_statement_type)
    const { data: existingDoc, error: fetchError } = await supabase
      .from('uploaded_documents')
      .select('extracted_data')
      .eq('id', documentId)
      .single();

    if (fetchError) {
      console.error('[DocumentProcessing] Error fetching existing document:', fetchError);
    }

    const existingMetadata = existingDoc?.extracted_data || {};
    console.log(`[DocumentProcessing] Existing metadata: bank_statement_type=${existingMetadata.bank_statement_type}`);

    // Update status to processing
    await supabase
      .from('uploaded_documents')
      .update({ status: 'processing' })
      .eq('id', documentId);

    // Get company data for entity matching
    const [{ data: trucks }, { data: drivers }] = await Promise.all([
      supabase.from('truck_heads').select('id, registration_number, brand, model').eq('company_id', companyId),
      supabase.from('drivers').select('id, first_name, last_name').eq('company_id', companyId),
    ]);

    const companyData = { trucks, drivers };

    let extractedText = '';
    const mimeCategory = getMimeCategory(mimeType);
    console.log(`[DocumentProcessing] Processing ${fileName}, mime: ${mimeType}, category: ${mimeCategory}`);

    // Extract text based on file type
    if (mimeCategory === 'pdf') {
      // Use pdf-parse for PDF files
      extractedText = await extractTextFromPDF(fileBuffer);
      console.log(`[DocumentProcessing] PDF text extracted, length: ${extractedText.length}, first 200 chars: ${extractedText.substring(0, 200).replace(/\n/g, ' ')}...`);
    } else if (mimeCategory === 'image') {
      // Use OpenAI Vision for images
      const base64 = fileBuffer.toString('base64');
      extractedText = await extractTextFromImage(base64, mimeType);
    } else if (mimeCategory === 'spreadsheet') {
      // Handle Excel and CSV files
      if (mimeType === 'text/csv') {
        extractedText = extractTextFromCSV(fileBuffer);
      } else {
        // Excel files (xlsx, xls)
        extractedText = extractTextFromExcel(fileBuffer);
      }
    } else if (mimeCategory === 'document') {
      // Handle Word documents (DOCX)
      if (mimeType.includes('wordprocessingml') || mimeType.includes('openxmlformats')) {
        extractedText = await extractTextFromDOCX(fileBuffer);
      } else {
        // Old .doc format - try to extract basic text
        extractedText = fileBuffer.toString('utf-8').replace(/[^\x20-\x7E\n\r]/g, ' ');
      }
    }

    // Classify document
    const classification = await classifyDocument(extractedText, fileName);
    console.log(`[DocumentProcessing] Classification: ${classification.document_type} (${classification.confidence * 100}% confidence)`);

    // Extract structured data
    const structuredData = await extractStructuredData(
      extractedText,
      classification.document_type,
      companyData
    );

    if (!structuredData) {
      console.error(`[DocumentProcessing] structuredData is null for ${classification.document_type}. Text length: ${extractedText.length}`);
    } else {
      console.log(`[DocumentProcessing] structuredData keys: ${Object.keys(structuredData).join(', ')}`);
    }

    // Match to entities
    const entityMatches = await matchToEntities(structuredData, companyId);

    // Prepare update data - set to needs_review so operator can validate
    // Store more raw text for multi-page documents like bank statements
    const isMultiPage = ['extras_bancar', 'raport_dkv', 'raport_eurowag', 'raport_verag', 'raport_shell', 'raport_omv'].includes(classification.document_type);
    const rawTextLimit = isMultiPage ? 50000 : 10000;

    const updateData = {
      status: 'needs_review',
      document_type: classification.document_type,
      document_category: classification.document_category,
      ai_confidence: classification.confidence * 100,
      ai_processed_at: new Date().toISOString(),
      extracted_data: {
        ...existingMetadata, // Preserve existing metadata (bank_statement_type, etc.)
        raw_text: extractedText.substring(0, rawTextLimit),
        structured: structuredData,
        classification,
      },
      ...entityMatches,
    };

    // Add extracted fields if available
    if (structuredData) {
      if (structuredData.document_date) updateData.document_date = structuredData.document_date;
      if (structuredData.document_number) updateData.document_number = structuredData.document_number;
      if (structuredData.amount) updateData.amount = structuredData.amount;
      if (structuredData.total_amount) updateData.amount = structuredData.total_amount;
      if (structuredData.currency) updateData.currency = structuredData.currency;
      if (structuredData.supplier_name) updateData.supplier_name = structuredData.supplier_name;
      if (structuredData.supplier_cui) updateData.supplier_cui = structuredData.supplier_cui;
    }

    // Log what we're about to save for bank statements
    if (classification.document_type === 'extras_bancar') {
      console.log(`[DocumentProcessing] Saving bank statement. structured is ${structuredData ? 'PRESENT' : 'NULL'}`);
      if (structuredData) {
        console.log(`[DocumentProcessing] Saving structured data with keys: ${Object.keys(structuredData).join(', ')}`);
        console.log(`[DocumentProcessing] Saving transactions: ${structuredData.transactions?.length || 0}`);
      }
    }

    // Update document record
    const { data, error } = await supabase
      .from('uploaded_documents')
      .update(updateData)
      .eq('id', documentId)
      .select()
      .single();

    if (error) {
      console.error(`[DocumentProcessing] Database update error:`, error);
      throw error;
    }

    // Verify what was saved
    if (classification.document_type === 'extras_bancar' && data) {
      const savedStructured = data.extracted_data?.structured;
      console.log(`[DocumentProcessing] Verified saved data - structured is ${savedStructured ? 'PRESENT' : 'MISSING'}`);
      if (savedStructured) {
        console.log(`[DocumentProcessing] Verified saved keys: ${Object.keys(savedStructured).join(', ')}`);
      }
    }

    const processingTime = Date.now() - startTime;
    console.log(`Document ${documentId} processed in ${processingTime}ms`);

    return {
      success: true,
      documentId,
      processingTime,
      classification,
      structuredData,
      entityMatches,
    };
  } catch (error) {
    console.error(`Error processing document ${documentId}:`, error);

    // Update document with error status
    await supabase
      .from('uploaded_documents')
      .update({
        status: 'failed',
        ai_error: error.message,
      })
      .eq('id', documentId);

    return {
      success: false,
      documentId,
      error: error.message,
    };
  }
}

/**
 * Create transaction from document data
 */
async function createTransactionFromDocument(documentId, companyId, userId) {
  const { data: doc, error } = await supabase
    .from('uploaded_documents')
    .select('*')
    .eq('id', documentId)
    .single();

  if (error || !doc) throw new Error('Document not found');

  const extractedData = doc.extracted_data?.structured;
  if (!extractedData || !doc.amount) {
    throw new Error('Document does not have extractable financial data');
  }

  const transactionData = {
    company_id: companyId,
    type: doc.document_type === 'factura_intrare' ? 'expense' : 'income',
    category: getTransactionCategory(doc.document_type),
    amount: doc.amount,
    currency: doc.currency || 'EUR',
    date: doc.document_date || new Date().toISOString().split('T')[0],
    description: `${doc.document_type} - ${doc.document_number || doc.file_name}`,
    invoice_number: doc.document_number,
    truck_id: doc.truck_id,
    driver_id: doc.driver_id,
    trip_id: doc.trip_id,
    external_ref: documentId,
    created_by: userId,
  };

  const { data: transaction, error: txError } = await supabase
    .from('transactions')
    .insert(transactionData)
    .select()
    .single();

  if (txError) throw txError;

  return transaction;
}

function getTransactionCategory(documentType) {
  const categoryMap = {
    factura_intrare: 'furnizori',
    factura_iesire: 'transport',
    raport_dkv: 'combustibil',
    raport_eurowag: 'combustibil',
    raport_verag: 'combustibil',
    extras_bancar: 'bancar',
    bon_fiscal: 'diverse',
  };
  return categoryMap[documentType] || 'altele';
}

module.exports = {
  DOCUMENT_TYPES,
  DOCUMENT_CATEGORIES,
  processDocument,
  classifyDocument,
  extractStructuredData,
  matchToEntities,
  findMatchingTrip,
  createTransactionFromDocument,
};
