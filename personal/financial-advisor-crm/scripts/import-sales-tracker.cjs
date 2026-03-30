const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const workbook = XLSX.readFile('/Users/bertwinromero/Downloads/Sales Tracker.xlsx');
const sheet = workbook.Sheets['EXISTING CLIENTS'];
const data = XLSX.utils.sheet_to_json(sheet);

// Constants
const ORG_ID = '11111111-1111-1111-1111-111111111111';
const USER_ID = '22222222-2222-2222-2222-222222222222';

// Helper functions
function sanitize(str) {
  if (!str || typeof str !== 'string') return str;
  // Remove newlines and normalize whitespace
  return str.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseName(fullName) {
  if (!fullName || typeof fullName !== 'string') return { first: 'Unknown', last: 'Client' };
  const cleaned = sanitize(fullName);
  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: '' };
  // Handle names like "Elena P. Yecyec" - last word is last name
  const last = parts.pop();
  const first = parts.join(' ');
  return { first, last };
}

function parsePremium(premium) {
  if (!premium || typeof premium !== 'string') return { amount: 0, frequency: 'annual' };
  const cleaned = premium.replace(/,/g, '').toLowerCase();
  const match = cleaned.match(/([\d.]+)\s*(monthly|quarterly|semi-annual|semi_annual|annual)?/);
  if (!match) return { amount: 0, frequency: 'annual' };

  const amount = parseFloat(match[1]) || 0;
  let frequency = 'annual';
  if (cleaned.includes('monthly')) frequency = 'monthly';
  else if (cleaned.includes('quarterly')) frequency = 'quarterly';
  else if (cleaned.includes('semi')) frequency = 'semi_annual';

  return { amount, frequency };
}

function parseDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  // Handle formats like "Sep. 19, 2017"
  const months = {
    'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06',
    'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
  };

  const match = dateStr.match(/(\w+)\.?\s*(\d+),?\s*(\d{4})/);
  if (!match) return null;

  const monthKey = match[1].toLowerCase().substring(0, 3);
  const month = months[monthKey];
  const day = match[2].padStart(2, '0');
  const year = match[3];

  return month ? `${year}-${month}-${day}` : null;
}

function parseNumber(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/,/g, '').replace(/[^\d.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
  return null;
}

function parseRiderAmount(val) {
  if (!val) return null;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    // Handle "CCB 280,000" or "LCB 300,000" or "1,000/DAY"
    const match = val.match(/([\d,]+)/);
    if (match) {
      return parseFloat(match[1].replace(/,/g, ''));
    }
  }
  return null;
}

function escapeSQL(str) {
  if (str === null || str === undefined) return 'NULL';
  const cleaned = sanitize(String(str));
  return "'" + cleaned.replace(/'/g, "''") + "'";
}

// Process clients
const validClients = data.filter(row =>
  row['Client Information'] &&
  typeof row['Client Information'] === 'string' &&
  row['Client Information'].trim() &&
  !row['Client Information'].includes('Client Information')
);

let sql = `-- Seed Data from Sales Tracker.xlsx
-- Generated on ${new Date().toISOString()}
-- Imports ${validClients.length} existing clients as leads with policies

DO $$
DECLARE
  org_id UUID := '${ORG_ID}';
  user_id UUID := '${USER_ID}';
  stage_won UUID;
  lead_id UUID;
BEGIN
  -- Get the "Issued - Won" stage (is_closed=true, is_won=true)
  SELECT id INTO stage_won FROM pipeline_stages
  WHERE organization_id = org_id AND is_closed = true AND is_won = true
  ORDER BY position LIMIT 1;

  -- If no won stage found, try to get by name
  IF stage_won IS NULL THEN
    SELECT id INTO stage_won FROM pipeline_stages
    WHERE organization_id = org_id AND name ILIKE '%won%'
    ORDER BY position LIMIT 1;
  END IF;

  -- Fallback to first stage
  IF stage_won IS NULL THEN
    SELECT id INTO stage_won FROM pipeline_stages
    WHERE organization_id = org_id ORDER BY position LIMIT 1;
  END IF;

`;

validClients.forEach((row, index) => {
  const name = parseName(row['Client Information']);
  const premium = parsePremium(row['Premium']);
  const effectiveDate = parseDate(row['Effectivity Date']);
  const fundValue = parseNumber(row['FUND VALUE AS OF MARCH 2024']);
  const sumAssured = parseNumber(row['Sum Assured']);

  // Build riders JSON
  const riders = {};

  const ccbAmount = parseRiderAmount(row['CCB/LCB']);
  if (ccbAmount) riders.ccb = { enabled: true, amount: ccbAmount };

  const tpdAmount = parseNumber(row['TPD']);
  if (tpdAmount) riders.tpd = { enabled: true, amount: tpdAmount };

  const coreAddAmount = parseNumber(row['Core ADD']);
  if (coreAddAmount) riders.core_add = { enabled: true, amount: coreAddAmount };

  if (row['WPTPD']) riders.wptpd = { enabled: true };

  const dhiVal = row['DHI'];
  if (dhiVal) {
    const dhiRate = parseRiderAmount(dhiVal);
    if (dhiRate) riders.dhi = { enabled: true, daily_rate: dhiRate };
  }

  const serAmount = parseNumber(row['SER']);
  if (serAmount) riders.ser = { enabled: true, amount: serAmount };

  const icuAmount = parseNumber(row['ICU']);
  if (icuAmount) riders.icu = { enabled: true, amount: icuAmount };

  const paAddAmount = parseNumber(row['PA ADD']);
  if (paAddAmount) riders.pa_add = { enabled: true, amount: paAddAmount };

  const paAtpdAmount = parseNumber(row['PA ATPD']);
  if (paAtpdAmount) riders.pa_atpd = { enabled: true, amount: paAtpdAmount };

  const maAmount = parseNumber(row['MURDER AND ASSAULT']);
  if (maAmount) riders.ma = { enabled: true, amount: maAmount };

  const amrAmount = parseNumber(row['ACC MEDICAL REIMBURSEMENT']);
  if (amrAmount) riders.amr = { enabled: true, amount: amrAmount };

  const fsAmount = parseNumber(row['FUTURE SAFE']);
  if (fsAmount) riders.fs = { enabled: true, amount: fsAmount };

  const bbAmount = parseNumber(row['Burial Benefit PA Standard Only']);
  if (bbAmount) riders.bb = { enabled: true, amount: bbAmount };

  const ridersJson = JSON.stringify(riders).replace(/'/g, "''");
  const clientName = sanitize(row['Client Information']);

  sql += `
  -- Client ${index + 1}: ${clientName}
  lead_id := gen_random_uuid();

  INSERT INTO leads (id, organization_id, assigned_to, stage_id, first_name, last_name, phone, occupation, notes, source, created_at, updated_at)
  VALUES (
    lead_id,
    org_id,
    user_id,
    stage_won,
    ${escapeSQL(name.first)},
    ${escapeSQL(name.last)},
    ${escapeSQL(row['CONTACT NUMBER'])},
    ${escapeSQL(row['OCCUPATION'])},
    ${escapeSQL(row['About my clients'])},
    'Sales Tracker Import',
    now(),
    now()
  );

  INSERT INTO policies (
    organization_id, client_id, created_by, policy_type, policy_name, policy_number, carrier,
    premium_amount, premium_frequency, effective_date,
    coverage_amount, fund_value, fund_value_date, riders, status, created_at
  )
  VALUES (
    org_id,
    lead_id,
    user_id,
    'life_insurance',
    ${escapeSQL(row['Plan Type'] || 'Life Insurance')},
    ${escapeSQL(row['Policy Number'])},
    'Pru Life UK',
    ${premium.amount || 0},
    '${premium.frequency}',
    ${effectiveDate ? `'${effectiveDate}'` : 'now()'},
    ${sumAssured || 'NULL'},
    ${fundValue || 'NULL'},
    ${fundValue ? "'2024-03-01'" : 'NULL'},
    '${ridersJson}'::jsonb,
    'active',
    now()
  );
`;
});

sql += `
END $$;
`;

// Write to migration file
const migrationPath = path.join(__dirname, '../supabase/migrations/012_import_sales_tracker.sql');
fs.writeFileSync(migrationPath, sql);
console.log(`Migration written to: ${migrationPath}`);
console.log(`Total clients imported: ${validClients.length}`);
