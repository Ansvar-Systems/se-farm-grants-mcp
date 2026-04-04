/**
 * Sweden Farm Grants MCP — Data Ingestion Script
 *
 * Sources:
 *   - Jordbruksverket (Swedish Board of Agriculture) — investment grants, environmental, young farmer
 *   - Tillvaxtverket (Swedish Agency for Economic and Regional Growth) — rural development
 *   - Lansstyrelsen (County Administrative Boards) — regional grants, predator protection
 *
 * Usage: npm run ingest
 */

import { createDatabase } from '../src/db.js';
import { mkdirSync, writeFileSync } from 'fs';

mkdirSync('data', { recursive: true });
const db = createDatabase('data/database.db');

const now = new Date().toISOString().split('T')[0];

// ─── GRANTS ───────────────────────────────────────────────────────────────────

interface Grant {
  id: string;
  name: string;
  grant_type: string;
  authority: string;
  budget: string | null;
  status: string;
  open_date: string | null;
  close_date: string | null;
  description: string;
  eligible_applicants: string;
  match_funding_pct: number | null;
  max_grant_value: number | null;
  jurisdiction: string;
}

const grants: Grant[] = [
  {
    id: 'investeringsstod-stallbyggnader',
    name: 'Investeringsstod — Stallbyggnader',
    grant_type: 'capital',
    authority: 'Jordbruksverket',
    budget: '500 MSEK',
    status: 'open',
    open_date: '2025-01-15',
    close_date: '2027-12-31',
    description: 'Investment support for new or renovated livestock buildings. Covers construction, ventilation, manure handling, and feed systems. Max 40% of eligible costs.',
    eligible_applicants: 'Active farmers with livestock production or planning to start. Must demonstrate economic viability in business plan.',
    match_funding_pct: 40,
    max_grant_value: 3600000,
    jurisdiction: 'SE',
  },
  {
    id: 'investeringsstod-energi',
    name: 'Investeringsstod — Fornybar energi',
    grant_type: 'capital',
    authority: 'Jordbruksverket',
    budget: '200 MSEK',
    status: 'open',
    open_date: '2025-01-15',
    close_date: '2027-12-31',
    description: 'Support for renewable energy installations on farms: solar panels, biogas plants, small wind turbines. Max 40% of eligible costs.',
    eligible_applicants: 'Active farmers and agricultural enterprises. Installation must primarily serve the farm operation.',
    match_funding_pct: 40,
    max_grant_value: 2400000,
    jurisdiction: 'SE',
  },
  {
    id: 'investeringsstod-bevattning',
    name: 'Investeringsstod — Bevattning',
    grant_type: 'capital',
    authority: 'Jordbruksverket',
    budget: '150 MSEK',
    status: 'open',
    open_date: '2025-01-15',
    close_date: '2027-12-31',
    description: 'Investment in water-efficient irrigation systems. Must reduce water consumption by at least 25% compared to existing system or demonstrate water-saving design for new installations.',
    eligible_applicants: 'Active farmers growing crops requiring irrigation. Priority for areas with documented water scarcity.',
    match_funding_pct: 40,
    max_grant_value: 1800000,
    jurisdiction: 'SE',
  },
  {
    id: 'investeringsstod-maskin',
    name: 'Investeringsstod — Precisionsodling',
    grant_type: 'capital',
    authority: 'Jordbruksverket',
    budget: '300 MSEK',
    status: 'open',
    open_date: '2025-01-15',
    close_date: '2027-12-31',
    description: 'GPS/precision farming equipment: RTK base stations, variable rate controllers, auto-steer systems, mapping drones. Max 40% of eligible costs.',
    eligible_applicants: 'Active farmers with minimum 30 ha arable land. Must demonstrate expected input reduction in business plan.',
    match_funding_pct: 40,
    max_grant_value: 1200000,
    jurisdiction: 'SE',
  },
  {
    id: 'startstod',
    name: 'Startstod',
    grant_type: 'young_farmer',
    authority: 'Jordbruksverket',
    budget: '100 MSEK',
    status: 'open',
    open_date: '2025-01-15',
    close_date: '2027-12-31',
    description: 'Lump sum grant for new farmers under 40 starting their first farm. Fixed amount of 250,000 SEK. Aimed at improving generational renewal in agriculture.',
    eligible_applicants: 'First-time farmers under 40 years old. Must have relevant education or 3 years farming experience. Must operate the farm for minimum 5 years.',
    match_funding_pct: null,
    max_grant_value: 250000,
    jurisdiction: 'SE',
  },
  {
    id: 'innovationsstod',
    name: 'Innovationsstod EIP-Agri',
    grant_type: 'competitive',
    authority: 'Jordbruksverket',
    budget: '80 MSEK',
    status: 'rolling',
    open_date: '2025-01-01',
    close_date: null,
    description: 'EIP-Agri innovation groups. Collaborative R&D projects between farmers, researchers, and advisors. 100% support for coordination and facilitation costs.',
    eligible_applicants: 'Groups of minimum 3 parties: at least 1 farmer, 1 researcher, 1 advisor. Lead applicant must be a legal entity.',
    match_funding_pct: 100,
    max_grant_value: 4000000,
    jurisdiction: 'SE',
  },
  {
    id: 'bredband-stod',
    name: 'Bredbandsstod',
    grant_type: 'infrastructure',
    authority: 'Jordbruksverket/PTS',
    budget: '3000 MSEK',
    status: 'open',
    open_date: '2025-03-01',
    close_date: '2027-06-30',
    description: 'Broadband infrastructure to rural areas lacking commercial coverage. Fiber-to-premises. Max 60% of eligible construction costs.',
    eligible_applicants: 'Municipalities, broadband associations (fiberforeningar), and other legal entities building broadband in rural areas with fewer than 200 inhabitants.',
    match_funding_pct: 60,
    max_grant_value: null,
    jurisdiction: 'SE',
  },
  {
    id: 'kompetensutveckling',
    name: 'Kompetensutveckling',
    grant_type: 'revenue',
    authority: 'Jordbruksverket',
    budget: '120 MSEK',
    status: 'rolling',
    open_date: '2025-01-01',
    close_date: null,
    description: 'Training, courses, study visits, and knowledge transfer for farmers. 100% of approved activity costs. Covers participation fees and reasonable travel.',
    eligible_applicants: 'Active farmers and forest owners. Activities must be approved by Jordbruksverket or delivered by approved training providers.',
    match_funding_pct: 100,
    max_grant_value: 50000,
    jurisdiction: 'SE',
  },
  {
    id: 'samarbetsstod',
    name: 'Samarbetsstod',
    grant_type: 'competitive',
    authority: 'Jordbruksverket',
    budget: '60 MSEK',
    status: 'rolling',
    open_date: '2025-01-01',
    close_date: null,
    description: 'Support for cooperation projects between farmers. Short supply chains, local markets, joint processing. Max 70% for cooperation costs.',
    eligible_applicants: 'Groups of at least 2 farmers or agricultural enterprises cooperating on a joint project. Must benefit primary production.',
    match_funding_pct: 70,
    max_grant_value: 2000000,
    jurisdiction: 'SE',
  },
  {
    id: 'miljoinvestering-vat',
    name: 'Miljoinvestering — Vatmark',
    grant_type: 'environmental',
    authority: 'Jordbruksverket',
    budget: '250 MSEK',
    status: 'open',
    open_date: '2025-01-15',
    close_date: '2027-12-31',
    description: 'Wetland creation or restoration for nutrient reduction and biodiversity. Max 90% of eligible costs for nutrient reduction wetlands, max 50% for biodiversity wetlands.',
    eligible_applicants: 'Landowners and tenants with long-term lease. Wetland must be in agricultural landscape. Priority for catchment areas with high nutrient loads.',
    match_funding_pct: 90,
    max_grant_value: 4500000,
    jurisdiction: 'SE',
  },
  {
    id: 'miljoinvestering-stangsel',
    name: 'Miljoinvestering — Stangsel mot rovdjur',
    grant_type: 'environmental',
    authority: 'Lansstyrelsen',
    budget: null,
    status: 'open',
    open_date: '2025-01-01',
    close_date: null,
    description: 'Predator-proof fencing for livestock protection. Electric fencing against wolf, lynx, bear. Max 100% in reindeer husbandry areas, max 80% elsewhere.',
    eligible_applicants: 'Livestock keepers in areas with documented predator presence. Application to the relevant county administrative board (Lansstyrelsen).',
    match_funding_pct: 100,
    max_grant_value: null,
    jurisdiction: 'SE',
  },
  {
    id: 'landsbygdsutveckling',
    name: 'Projektstod landsbygdsutveckling',
    grant_type: 'competitive',
    authority: 'Tillvaxtverket/Lansstyrelsen',
    budget: '400 MSEK',
    status: 'rolling',
    open_date: '2025-01-01',
    close_date: null,
    description: 'Rural development projects: farm shops, agritourism, local food processing, rural services. Max 50% of eligible project costs.',
    eligible_applicants: 'Farmers, small enterprises, non-profits, and municipalities in rural areas. Project must benefit rural development and create lasting value.',
    match_funding_pct: 50,
    max_grant_value: 3000000,
    jurisdiction: 'SE',
  },
];

console.log(`Inserting ${grants.length} grants...`);

const insertGrant = db.instance.prepare(
  `INSERT OR REPLACE INTO grants (id, name, grant_type, authority, budget, status, open_date, close_date, description, eligible_applicants, match_funding_pct, max_grant_value, jurisdiction)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

for (const g of grants) {
  insertGrant.run(g.id, g.name, g.grant_type, g.authority, g.budget, g.status, g.open_date, g.close_date, g.description, g.eligible_applicants, g.match_funding_pct, g.max_grant_value, g.jurisdiction);
}

// ─── GRANT ITEMS ──────────────────────────────────────────────────────────────

interface GrantItem {
  id: string;
  grant_id: string;
  item_code: string;
  name: string;
  description: string;
  specification: string | null;
  grant_value: number | null;
  grant_unit: string;
  category: string;
  jurisdiction: string;
}

const grantItems: GrantItem[] = [
  // Stallbyggnader items
  { id: 'stall-01', grant_id: 'investeringsstod-stallbyggnader', item_code: 'SB-001', name: 'Ny mjolkladugard', description: 'New dairy barn construction including concrete foundation, steel frame, roofing, and interior fittings', specification: 'Min 50 djurplatser, ventilation per SJV 2021:15', grant_value: 45000, grant_unit: 'SEK/djurplats', category: 'building', jurisdiction: 'SE' },
  { id: 'stall-02', grant_id: 'investeringsstod-stallbyggnader', item_code: 'SB-002', name: 'Renovering befintlig ladugard', description: 'Renovation of existing livestock barn: structural repairs, new roofing, insulation upgrade', specification: 'Byggnaden maste vara aldre an 15 ar', grant_value: 25000, grant_unit: 'SEK/djurplats', category: 'building', jurisdiction: 'SE' },
  { id: 'stall-03', grant_id: 'investeringsstod-stallbyggnader', item_code: 'SB-003', name: 'Godselforrad', description: 'Manure storage facility: concrete tank or covered lagoon. Must meet 8-month storage capacity.', specification: '8 manaders lagringskapacitet, tackning kravs', grant_value: 300, grant_unit: 'SEK/m3', category: 'manure', jurisdiction: 'SE' },
  { id: 'stall-04', grant_id: 'investeringsstod-stallbyggnader', item_code: 'SB-004', name: 'Foderforrad', description: 'Feed storage: silos, hay barns, grain drying and storage systems', specification: null, grant_value: 800000, grant_unit: 'SEK', category: 'storage', jurisdiction: 'SE' },
  { id: 'stall-05', grant_id: 'investeringsstod-stallbyggnader', item_code: 'SB-005', name: 'Mjolkningsutrustning', description: 'Milking parlour or robot system installation', specification: 'VMS eller karusell for min 60 kor', grant_value: 1200000, grant_unit: 'SEK', category: 'equipment', jurisdiction: 'SE' },
  { id: 'stall-06', grant_id: 'investeringsstod-stallbyggnader', item_code: 'SB-006', name: 'Ventilationssystem', description: 'Climate control and ventilation system for livestock buildings', specification: 'Per SJV 2021:15 djurskyddsforeskrifter', grant_value: 150000, grant_unit: 'SEK', category: 'equipment', jurisdiction: 'SE' },

  // Precisionsodling items
  { id: 'prec-01', grant_id: 'investeringsstod-maskin', item_code: 'PM-001', name: 'RTK-basstation', description: 'RTK base station for centimeter-accuracy GPS positioning. Covers base unit, antenna, and network subscription.', specification: 'RTK-korrektion, +/- 2.5 cm noggrannhet', grant_value: 180000, grant_unit: 'SEK', category: 'gps', jurisdiction: 'SE' },
  { id: 'prec-02', grant_id: 'investeringsstod-maskin', item_code: 'PM-002', name: 'Autostyrning', description: 'Auto-steer system for tractor: receiver, controller, hydraulic valve kit', specification: 'Kompatibel med RTK, min +-2.5 cm', grant_value: 250000, grant_unit: 'SEK', category: 'gps', jurisdiction: 'SE' },
  { id: 'prec-03', grant_id: 'investeringsstod-maskin', item_code: 'PM-003', name: 'Variabel givaregulator', description: 'Variable rate application controller for fertiliser spreader or sprayer', specification: 'ISOBUS-kompatibel', grant_value: 120000, grant_unit: 'SEK', category: 'equipment', jurisdiction: 'SE' },
  { id: 'prec-04', grant_id: 'investeringsstod-maskin', item_code: 'PM-004', name: 'Kartlaggningsdronare', description: 'Multispectral mapping drone for crop monitoring and biomass estimation', specification: 'Multispektral sensor, NDVI-kapacitet', grant_value: 95000, grant_unit: 'SEK', category: 'equipment', jurisdiction: 'SE' },
  { id: 'prec-05', grant_id: 'investeringsstod-maskin', item_code: 'PM-005', name: 'Markkarteringspaket', description: 'Soil mapping package: EM38 sensor, GPS logger, and lab analysis', specification: null, grant_value: 1500, grant_unit: 'SEK/ha', category: 'services', jurisdiction: 'SE' },
  { id: 'prec-06', grant_id: 'investeringsstod-maskin', item_code: 'PM-006', name: 'Sektionsavstangning spruta', description: 'Section control upgrade for existing sprayer', specification: 'Min 5 sektioner, GPS-baserad', grant_value: 85000, grant_unit: 'SEK', category: 'equipment', jurisdiction: 'SE' },

  // Energy items
  { id: 'enrg-01', grant_id: 'investeringsstod-energi', item_code: 'EN-001', name: 'Solcellsanlaggning', description: 'Solar panel installation on farm buildings. Includes panels, inverter, mounting, and grid connection.', specification: 'Min 10 kW, max 500 kW', grant_value: 8000, grant_unit: 'SEK/kW', category: 'solar', jurisdiction: 'SE' },
  { id: 'enrg-02', grant_id: 'investeringsstod-energi', item_code: 'EN-002', name: 'Biogasanlaggning', description: 'On-farm biogas plant for manure and organic waste digestion', specification: 'Min 50 kW termisk effekt', grant_value: 2400000, grant_unit: 'SEK', category: 'biogas', jurisdiction: 'SE' },
  { id: 'enrg-03', grant_id: 'investeringsstod-energi', item_code: 'EN-003', name: 'Vindkraftverk', description: 'Small wind turbine for on-farm electricity generation', specification: 'Max 500 kW, max 50 m navhojd', grant_value: 12000, grant_unit: 'SEK/kW', category: 'wind', jurisdiction: 'SE' },
  { id: 'enrg-04', grant_id: 'investeringsstod-energi', item_code: 'EN-004', name: 'Energilagring batteri', description: 'Battery storage system paired with renewable energy installation', specification: 'Min 10 kWh, litiumjon eller likvardigt', grant_value: 5000, grant_unit: 'SEK/kWh', category: 'storage', jurisdiction: 'SE' },

  // Bevattning items
  { id: 'bevt-01', grant_id: 'investeringsstod-bevattning', item_code: 'BV-001', name: 'Droppbevattningssystem', description: 'Drip irrigation system: main lines, laterals, emitters, filter station', specification: 'Min 25% vattenreduktion', grant_value: 25000, grant_unit: 'SEK/ha', category: 'irrigation', jurisdiction: 'SE' },
  { id: 'bevt-02', grant_id: 'investeringsstod-bevattning', item_code: 'BV-002', name: 'Bevattningsdamm', description: 'Irrigation reservoir for water storage and buffering', specification: 'Min 5000 m3 kapacitet', grant_value: 120, grant_unit: 'SEK/m3', category: 'water_storage', jurisdiction: 'SE' },
  { id: 'bevt-03', grant_id: 'investeringsstod-bevattning', item_code: 'BV-003', name: 'Fuktsensor-natverk', description: 'Soil moisture sensor network for precision irrigation scheduling', specification: 'Min 3 sensorer per falt', grant_value: 45000, grant_unit: 'SEK', category: 'equipment', jurisdiction: 'SE' },

  // Miljoinvestering items
  { id: 'milj-01', grant_id: 'miljoinvestering-vat', item_code: 'MV-001', name: 'Vatmarksanlaggning', description: 'Wetland construction: excavation, embankments, inlet/outlet structures', specification: 'Min 0.5 ha vattenyta, max 10 ha', grant_value: 450000, grant_unit: 'SEK/ha', category: 'construction', jurisdiction: 'SE' },
  { id: 'milj-02', grant_id: 'miljoinvestering-vat', item_code: 'MV-002', name: 'Tvastegsfosfordike', description: 'Two-stage phosphorus ditch with reactive filter material', specification: null, grant_value: 800, grant_unit: 'SEK/m', category: 'construction', jurisdiction: 'SE' },

  // Stangsel items
  { id: 'rovd-01', grant_id: 'miljoinvestering-stangsel', item_code: 'RS-001', name: 'Elstangsel 5-trad', description: 'Five-wire electric fence against wolf and bear. Includes posts, wire, energiser.', specification: 'Min 5 tradar, min 4500V, jordning per SJV', grant_value: 75, grant_unit: 'SEK/m', category: 'fencing', jurisdiction: 'SE' },
  { id: 'rovd-02', grant_id: 'miljoinvestering-stangsel', item_code: 'RS-002', name: 'Nattfalla', description: 'Portable night enclosure for sheep and goats in predator areas', specification: 'Min 90 cm hojd, dubbelgrindar', grant_value: 35000, grant_unit: 'SEK', category: 'fencing', jurisdiction: 'SE' },
];

console.log(`Inserting ${grantItems.length} grant items...`);

const insertItem = db.instance.prepare(
  `INSERT OR REPLACE INTO grant_items (id, grant_id, item_code, name, description, specification, grant_value, grant_unit, category, jurisdiction)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

for (const item of grantItems) {
  insertItem.run(item.id, item.grant_id, item.item_code, item.name, item.description, item.specification, item.grant_value, item.grant_unit, item.category, item.jurisdiction);
}

// ─── STACKING RULES ───────────────────────────────────────────────────────────

interface StackingRule {
  grant_a: string;
  grant_b: string;
  compatible: number;
  conditions: string | null;
  jurisdiction: string;
}

const stackingRules: StackingRule[] = [
  // Investeringsstod schemes are mutually exclusive for the SAME investment
  { grant_a: 'investeringsstod-stallbyggnader', grant_b: 'investeringsstod-energi', compatible: 0, conditions: 'Mutually exclusive for the same eligible cost. A single cost item cannot receive support from two investment grants. Separate items on the same farm are allowed.', jurisdiction: 'SE' },
  { grant_a: 'investeringsstod-stallbyggnader', grant_b: 'investeringsstod-bevattning', compatible: 0, conditions: 'Mutually exclusive for the same eligible cost. Different investment items on the same farm are allowed.', jurisdiction: 'SE' },
  { grant_a: 'investeringsstod-stallbyggnader', grant_b: 'investeringsstod-maskin', compatible: 0, conditions: 'Mutually exclusive for the same eligible cost. Different investment items on the same farm are allowed.', jurisdiction: 'SE' },
  { grant_a: 'investeringsstod-energi', grant_b: 'investeringsstod-bevattning', compatible: 0, conditions: 'Mutually exclusive for the same eligible cost. Different investment items on the same farm are allowed.', jurisdiction: 'SE' },
  { grant_a: 'investeringsstod-energi', grant_b: 'investeringsstod-maskin', compatible: 0, conditions: 'Mutually exclusive for the same eligible cost. Different investment items on the same farm are allowed.', jurisdiction: 'SE' },
  { grant_a: 'investeringsstod-bevattning', grant_b: 'investeringsstod-maskin', compatible: 0, conditions: 'Mutually exclusive for the same eligible cost. Different investment items on the same farm are allowed.', jurisdiction: 'SE' },

  // Startstod + investeringsstod = compatible
  { grant_a: 'startstod', grant_b: 'investeringsstod-stallbyggnader', compatible: 1, conditions: 'Young farmers can combine start-up grant with investment support. Common combination. Business plan should reference both.', jurisdiction: 'SE' },
  { grant_a: 'startstod', grant_b: 'investeringsstod-energi', compatible: 1, conditions: 'Young farmers can combine start-up grant with investment support.', jurisdiction: 'SE' },
  { grant_a: 'startstod', grant_b: 'investeringsstod-maskin', compatible: 1, conditions: 'Young farmers can combine start-up grant with precision farming investment.', jurisdiction: 'SE' },
  { grant_a: 'startstod', grant_b: 'investeringsstod-bevattning', compatible: 1, conditions: 'Young farmers can combine start-up grant with irrigation investment.', jurisdiction: 'SE' },

  // Investeringsstod + miljoersattning = compatible
  { grant_a: 'investeringsstod-stallbyggnader', grant_b: 'miljoinvestering-vat', compatible: 1, conditions: 'Investment grants and environmental payments cover different purposes. Can run concurrently on the same farm.', jurisdiction: 'SE' },
  { grant_a: 'investeringsstod-energi', grant_b: 'miljoinvestering-vat', compatible: 1, conditions: 'Renewable energy and wetland investment are complementary. Both can be on the same holding.', jurisdiction: 'SE' },
  { grant_a: 'investeringsstod-stallbyggnader', grant_b: 'miljoinvestering-stangsel', compatible: 1, conditions: 'Livestock building investment and predator fencing are complementary measures.', jurisdiction: 'SE' },

  // Kompetensutveckling is compatible with everything
  { grant_a: 'kompetensutveckling', grant_b: 'investeringsstod-stallbyggnader', compatible: 1, conditions: 'Training support stacks freely with all other grants. Encouraged as part of investment preparation.', jurisdiction: 'SE' },
  { grant_a: 'kompetensutveckling', grant_b: 'investeringsstod-maskin', compatible: 1, conditions: 'Training on precision farming technology recommended alongside equipment investment.', jurisdiction: 'SE' },
  { grant_a: 'kompetensutveckling', grant_b: 'startstod', compatible: 1, conditions: 'Young farmer training is encouraged alongside start-up grant.', jurisdiction: 'SE' },

  // Innovation and cooperation
  { grant_a: 'innovationsstod', grant_b: 'samarbetsstod', compatible: 0, conditions: 'EIP-Agri innovation projects and cooperation grants cannot fund the same activity. Choose one framework.', jurisdiction: 'SE' },
  { grant_a: 'innovationsstod', grant_b: 'investeringsstod-maskin', compatible: 1, conditions: 'Innovation project can lead to investment. Investment grant for resulting equipment is separate.', jurisdiction: 'SE' },
  { grant_a: 'landsbygdsutveckling', grant_b: 'samarbetsstod', compatible: 1, conditions: 'Rural development and cooperation grants can complement each other if covering different cost items.', jurisdiction: 'SE' },
];

console.log(`Inserting ${stackingRules.length} stacking rules...`);

const insertStacking = db.instance.prepare(
  `INSERT OR REPLACE INTO stacking_rules (grant_a, grant_b, compatible, conditions, jurisdiction)
   VALUES (?, ?, ?, ?, ?)`
);

for (const rule of stackingRules) {
  insertStacking.run(rule.grant_a, rule.grant_b, rule.compatible, rule.conditions, rule.jurisdiction);
}

// ─── APPLICATION GUIDANCE ─────────────────────────────────────────────────────

interface AppGuidance {
  grant_id: string;
  step_order: number;
  description: string;
  evidence_required: string | null;
  portal: string | null;
  jurisdiction: string;
}

const applicationGuidance: AppGuidance[] = [
  // Generic investment grant process (stallbyggnader as primary example)
  { grant_id: 'investeringsstod-stallbyggnader', step_order: 1, description: 'Registrera dig som kund hos Jordbruksverket. Skaffa e-legitimation (BankID) for inloggning i e-tjansten.', evidence_required: 'BankID, organisationsnummer', portal: 'https://jordbruksverket.se/e-tjanster', jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-stallbyggnader', step_order: 2, description: 'Gor en SAM-ansokan (Samansokningsanskan) for att registrera ditt jordbruksforetag och dina skiften.', evidence_required: 'Fastighetsuppgifter, arrendekontrakt, djurantal', portal: 'https://jordbruksverket.se/e-tjanster/sam-internet', jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-stallbyggnader', step_order: 3, description: 'Ta fram en affarsplan som visar investeringens lonsamhet, beraknad produktionsokning, och finansieringsplan.', evidence_required: 'Affarsplan, kalkyl (3-5 ar), bankbesked eller lan-loften', portal: null, jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-stallbyggnader', step_order: 4, description: 'Gor en upphandling: ta in minst 2 offerter for byggnation och utrustning. Dokumentera processen.', evidence_required: 'Min 2 offerter per kostnadskategori, upphandlingsprotokoll', portal: null, jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-stallbyggnader', step_order: 5, description: 'Skicka in ansokan i Jordbruksverkets e-tjanst. Bifoga alla bilagor. Vanta pa beslut innan du paborjar investeringen.', evidence_required: 'Komplett ansokan, affarsplan, offerter, ritningar, eventuellt bygglov', portal: 'https://jordbruksverket.se/e-tjanster', jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-stallbyggnader', step_order: 6, description: 'Genomfor investeringen efter beviljat beslut. Samla alla kvitton och fakturor.', evidence_required: 'Fakturor, betalningsbevis (kontoutdrag), fotodokumentation', portal: null, jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-stallbyggnader', step_order: 7, description: 'Ansok om slutbetalning. Bifoga redovisning, fakturor och slutrapport.', evidence_required: 'Slutredovisning, alla fakturor, fotodokumentation fore/efter, revisorsyttrande (om >1 MSEK)', portal: 'https://jordbruksverket.se/e-tjanster', jurisdiction: 'SE' },

  // Energi — same pattern, abbreviated
  { grant_id: 'investeringsstod-energi', step_order: 1, description: 'Registrering och SAM-ansokan (se stallbyggnader-processen).', evidence_required: 'BankID, organisationsnummer, SAM-ansokan', portal: 'https://jordbruksverket.se/e-tjanster', jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-energi', step_order: 2, description: 'Bestall energikartlaggning av godkand energiradgivare. Visar energibehov och lamplig teknologi.', evidence_required: 'Energikartlaggningsrapport', portal: null, jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-energi', step_order: 3, description: 'Ta in offerter fran min 2 leverantorer. For solceller: inklusive dimensionering, montage och natanslutning.', evidence_required: 'Min 2 offerter, teknisk specifikation', portal: null, jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-energi', step_order: 4, description: 'Skicka in ansokan med energikartlaggning och offerter. Vanta pa beslut.', evidence_required: 'Komplett ansokan, energikartlaggning, offerter', portal: 'https://jordbruksverket.se/e-tjanster', jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-energi', step_order: 5, description: 'Genomfor installation och ansok om slutbetalning.', evidence_required: 'Fakturor, installationsintyg, driftsattningsprotokoll', portal: 'https://jordbruksverket.se/e-tjanster', jurisdiction: 'SE' },

  // Precision farming
  { grant_id: 'investeringsstod-maskin', step_order: 1, description: 'Registrering och SAM-ansokan med minst 30 ha aker registrerad.', evidence_required: 'BankID, SAM-ansokan, min 30 ha aker', portal: 'https://jordbruksverket.se/e-tjanster/sam-internet', jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-maskin', step_order: 2, description: 'Dokumentera nuvarande insatsmedelsforbrukning (godsel, bekampningsmedel) som referens.', evidence_required: 'Odlingsplan, insatsmedelsjournal, senaste 3 ars forbrukning', portal: null, jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-maskin', step_order: 3, description: 'Ta fram kalkyl for forvantad minskning av insatsmedel genom precision farming.', evidence_required: 'Kalkyl, leverantorsreferenser, affarsplan', portal: null, jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-maskin', step_order: 4, description: 'Offerter fran min 2 leverantorer for varje utrustningsdel.', evidence_required: 'Min 2 offerter, teknisk specifikation', portal: null, jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-maskin', step_order: 5, description: 'Skicka in ansokan. Vanta pa beslut innan inkop.', evidence_required: 'Komplett ansokan, offerter, kalkyl, affarsplan', portal: 'https://jordbruksverket.se/e-tjanster', jurisdiction: 'SE' },

  // Startstod
  { grant_id: 'startstod', step_order: 1, description: 'Sakerhetsstall att du uppfyller villkoren: under 40 ar, forsta gardsforetaget, relevant utbildning eller 3 ars erfarenhet.', evidence_required: 'Utbildningsbevis eller referensbrev', portal: null, jurisdiction: 'SE' },
  { grant_id: 'startstod', step_order: 2, description: 'Registrera jordbruksforetag och gor SAM-ansokan.', evidence_required: 'Organisationsnummer, fastighetsbeteckning, SAM-ansokan', portal: 'https://jordbruksverket.se/e-tjanster/sam-internet', jurisdiction: 'SE' },
  { grant_id: 'startstod', step_order: 3, description: 'Skriv affarsplan for gardsdriften (min 5 ar). Visa hur gardsforetaget ska bli lonsammt.', evidence_required: 'Affarsplan, budget, produktionsplan', portal: null, jurisdiction: 'SE' },
  { grant_id: 'startstod', step_order: 4, description: 'Skicka in ansokan om startstod i Jordbruksverkets e-tjanst.', evidence_required: 'Komplett ansokan, affarsplan, aldersbevis, utbildningsbevis', portal: 'https://jordbruksverket.se/e-tjanster', jurisdiction: 'SE' },
  { grant_id: 'startstod', step_order: 5, description: 'Efter beviljning: driva gardsforetaget i minst 5 ar. Arlig uppfoljning via SAM-ansokan.', evidence_required: 'Arlig SAM-ansokan, deklaration', portal: null, jurisdiction: 'SE' },

  // Miljoinvestering vatmark
  { grant_id: 'miljoinvestering-vat', step_order: 1, description: 'Kontakta Lansstyrelsen for en forhandsbedommning av lamplig plats for vatmark.', evidence_required: 'Kartunderlag, fastighetsinformation', portal: null, jurisdiction: 'SE' },
  { grant_id: 'miljoinvestering-vat', step_order: 2, description: 'Anlita vatmarksradgivare for projektering. Inkluderar hydrologi, ritningar, och miljokonsekvensbedomming.', evidence_required: 'Projekteringsrapport, ritningar, hydrologisk utredning', portal: null, jurisdiction: 'SE' },
  { grant_id: 'miljoinvestering-vat', step_order: 3, description: 'Sok tillstand for vatverksamhet hos Lansstyrelsen (miljobalkens 11 kap).', evidence_required: 'Anmalan/tillstandsansokan, miljokonsekvensbedomning', portal: 'https://www.lansstyrelsen.se', jurisdiction: 'SE' },
  { grant_id: 'miljoinvestering-vat', step_order: 4, description: 'Ansokan till Jordbruksverket med projekteringsunderlag och tillstand.', evidence_required: 'Komplett ansokan, projektering, tillstand, offerter', portal: 'https://jordbruksverket.se/e-tjanster', jurisdiction: 'SE' },
  { grant_id: 'miljoinvestering-vat', step_order: 5, description: 'Genomfor anlaggningen och ansok om slutbetalning med dokumentation.', evidence_required: 'Slutredovisning, fakturor, fotodokumentation, funktionstest', portal: 'https://jordbruksverket.se/e-tjanster', jurisdiction: 'SE' },

  // Stangsel mot rovdjur
  { grant_id: 'miljoinvestering-stangsel', step_order: 1, description: 'Kontakta din Lansstyrelse for att verifiera att omradet klassas som rovdjursomrade.', evidence_required: 'Rovdjursinventering eller besiktningstjanst', portal: 'https://www.lansstyrelsen.se', jurisdiction: 'SE' },
  { grant_id: 'miljoinvestering-stangsel', step_order: 2, description: 'Planera stangselstrackning med Lansstyrelsens rovdjurshandlaggare.', evidence_required: 'Kartskiss, betesareal, antal djur', portal: null, jurisdiction: 'SE' },
  { grant_id: 'miljoinvestering-stangsel', step_order: 3, description: 'Ansokan om stangselstod till Lansstyrelsen.', evidence_required: 'Ansokan, kartskiss, offerter, registrerat djurhall', portal: 'https://www.lansstyrelsen.se', jurisdiction: 'SE' },
  { grant_id: 'miljoinvestering-stangsel', step_order: 4, description: 'Sakerhetsstall material och uppfor stangsel enligt specifikation.', evidence_required: 'Fakturor, fotodokumentation', portal: null, jurisdiction: 'SE' },
  { grant_id: 'miljoinvestering-stangsel', step_order: 5, description: 'Besiktning av Lansstyrelsen och slutbetalning.', evidence_required: 'Slutredovisning, besiktningsprotokoll', portal: 'https://www.lansstyrelsen.se', jurisdiction: 'SE' },

  // Bevattning
  { grant_id: 'investeringsstod-bevattning', step_order: 1, description: 'Registrering, SAM-ansokan, och kartlaggning av nuvarande vattenanvandning.', evidence_required: 'BankID, SAM-ansokan, vattenforbrukningsdata', portal: 'https://jordbruksverket.se/e-tjanster/sam-internet', jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-bevattning', step_order: 2, description: 'Bevattningsplan fran radgivare: vattenbehov, vattenresurser, sparpotential.', evidence_required: 'Bevattningsplan, vattenbalansberakning', portal: null, jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-bevattning', step_order: 3, description: 'Vattenuttag: sok tillstand for vattenuttag om >600 m3/dygn (Lansstyrelsen).', evidence_required: 'Tillstandsansokan eller anmalan for vattenuttag', portal: 'https://www.lansstyrelsen.se', jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-bevattning', step_order: 4, description: 'Ta in offerter och skicka in ansokan om investeringsstod.', evidence_required: 'Komplett ansokan, bevattningsplan, offerter, vattendomstillstand', portal: 'https://jordbruksverket.se/e-tjanster', jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-bevattning', step_order: 5, description: 'Installation, verifiering av vattensparmalet (25%), slutbetalning.', evidence_required: 'Vattenmatningsdata, fakturor, installationsprotokoll', portal: 'https://jordbruksverket.se/e-tjanster', jurisdiction: 'SE' },

  // Kompetensutveckling
  { grant_id: 'kompetensutveckling', step_order: 1, description: 'Hitta godkand utbildningsaktivitet i Jordbruksverkets utbildningskalender.', evidence_required: null, portal: 'https://jordbruksverket.se/utbildning', jurisdiction: 'SE' },
  { grant_id: 'kompetensutveckling', step_order: 2, description: 'Anmal dig till utbildningen och ansok om kompetensutvecklingsstod.', evidence_required: 'Anmalan, SAM-kundsid', portal: 'https://jordbruksverket.se/e-tjanster', jurisdiction: 'SE' },
  { grant_id: 'kompetensutveckling', step_order: 3, description: 'Genomfor utbildningen och erhall deltagarintyg.', evidence_required: 'Deltagarintyg, narvarolista', portal: null, jurisdiction: 'SE' },

  // Innovationsstod
  { grant_id: 'innovationsstod', step_order: 1, description: 'Formera innovationsgrupp: min 1 lantbrukare, 1 forskare, 1 radgivare.', evidence_required: 'Avsiktsforklaring fran samtliga parter', portal: null, jurisdiction: 'SE' },
  { grant_id: 'innovationsstod', step_order: 2, description: 'Utveckla projektplan: problem, metod, forvantade resultat, budget, tidsplan.', evidence_required: 'Projektplan, budget, CV for nyckelpersoner', portal: null, jurisdiction: 'SE' },
  { grant_id: 'innovationsstod', step_order: 3, description: 'Skicka in ansokan till Jordbruksverket via e-tjanst.', evidence_required: 'Komplett ansokan, projektplan, samtliga bilagor', portal: 'https://jordbruksverket.se/e-tjanster', jurisdiction: 'SE' },
  { grant_id: 'innovationsstod', step_order: 4, description: 'Genomfor projektet, rapportera framsteg halvarsvis.', evidence_required: 'Halvarsrapporter, ekonomisk redovisning', portal: null, jurisdiction: 'SE' },
  { grant_id: 'innovationsstod', step_order: 5, description: 'Slutrapport med resultat och spridningsplan.', evidence_required: 'Slutrapport, ekonomisk slutredovisning, spridningsplan', portal: 'https://jordbruksverket.se/e-tjanster', jurisdiction: 'SE' },

  // Landsbygdsutveckling
  { grant_id: 'landsbygdsutveckling', step_order: 1, description: 'Kontakta Lansstyrelsen eller Tillvaxtverket for att diskutera projektiden.', evidence_required: null, portal: 'https://www.lansstyrelsen.se', jurisdiction: 'SE' },
  { grant_id: 'landsbygdsutveckling', step_order: 2, description: 'Skriv projektplan med mal, aktiviteter, budget och forvantade resultat.', evidence_required: 'Projektplan, budget, tidsplan', portal: null, jurisdiction: 'SE' },
  { grant_id: 'landsbygdsutveckling', step_order: 3, description: 'Skicka in ansokan till Jordbruksverkets e-tjanst.', evidence_required: 'Komplett ansokan, projektplan, CV, medfinansieringsintyg', portal: 'https://jordbruksverket.se/e-tjanster', jurisdiction: 'SE' },
  { grant_id: 'landsbygdsutveckling', step_order: 4, description: 'Genomfor projektet enligt plan. Lopande redovisning.', evidence_required: 'Lagesrapporter, ekonomisk uppfoljning', portal: null, jurisdiction: 'SE' },
  { grant_id: 'landsbygdsutveckling', step_order: 5, description: 'Slutredovisning och slutbetalning.', evidence_required: 'Slutrapport, ekonomisk slutredovisning, resultatbevis', portal: 'https://jordbruksverket.se/e-tjanster', jurisdiction: 'SE' },

  // Samarbetsstod
  { grant_id: 'samarbetsstod', step_order: 1, description: 'Identifiera samarbetspartners (min 2 lantbruksforetag).', evidence_required: 'Samarbetsavtal eller avsiktsforklaring', portal: null, jurisdiction: 'SE' },
  { grant_id: 'samarbetsstod', step_order: 2, description: 'Ta fram projektplan for samarbetet: korta leveranskedjor, lokal marknad, gemensam forardling.', evidence_required: 'Projektplan, budget, marknadsanalys', portal: null, jurisdiction: 'SE' },
  { grant_id: 'samarbetsstod', step_order: 3, description: 'Skicka in ansokan.', evidence_required: 'Komplett ansokan, samarbetsavtal, projektplan', portal: 'https://jordbruksverket.se/e-tjanster', jurisdiction: 'SE' },
  { grant_id: 'samarbetsstod', step_order: 4, description: 'Genomfor samarbetsprojektet. Halvarsredovisning.', evidence_required: 'Lagesrapporter, fakturor', portal: null, jurisdiction: 'SE' },
  { grant_id: 'samarbetsstod', step_order: 5, description: 'Slutrapport och slutbetalning.', evidence_required: 'Slutrapport, ekonomisk slutredovisning', portal: 'https://jordbruksverket.se/e-tjanster', jurisdiction: 'SE' },

  // Bredband
  { grant_id: 'bredband-stod', step_order: 1, description: 'Bilda bredbandsforening eller identifiera projektansokan via kommun.', evidence_required: 'Stadgar, medlemsforteckning eller kommunbeslut', portal: null, jurisdiction: 'SE' },
  { grant_id: 'bredband-stod', step_order: 2, description: 'Ta fram projekteringsunderlag: trasadragning, husanslutningar, kostnadsberakning.', evidence_required: 'Projekteringsrapport, karta, kostnadsberakning', portal: null, jurisdiction: 'SE' },
  { grant_id: 'bredband-stod', step_order: 3, description: 'Sok tillstand for ledningsdragning och markavtal med berorda markagare.', evidence_required: 'Markavtal, ledningsratt, tillstandsdokument', portal: null, jurisdiction: 'SE' },
  { grant_id: 'bredband-stod', step_order: 4, description: 'Skicka in ansokan till PTS eller Lansstyrelsen.', evidence_required: 'Komplett ansokan, projektering, markavtal, budget', portal: 'https://pts.se/bredband', jurisdiction: 'SE' },
  { grant_id: 'bredband-stod', step_order: 5, description: 'Genomfor byggnation, driftsatt, slutbetalning.', evidence_required: 'Besiktningsprotokoll, fakturor, anslutningsstatistik', portal: 'https://pts.se/bredband', jurisdiction: 'SE' },
];

console.log(`Inserting ${applicationGuidance.length} application guidance steps...`);

const insertGuidance = db.instance.prepare(
  `INSERT OR REPLACE INTO application_guidance (grant_id, step_order, description, evidence_required, portal, jurisdiction)
   VALUES (?, ?, ?, ?, ?, ?)`
);

for (const g of applicationGuidance) {
  insertGuidance.run(g.grant_id, g.step_order, g.description, g.evidence_required, g.portal, g.jurisdiction);
}

// ─── FTS5 SEARCH INDEX ────────────────────────────────────────────────────────

console.log('Building FTS5 search index...');

// Clear existing index
db.run('DELETE FROM search_index');

const insertIndex = db.instance.prepare(
  'INSERT INTO search_index (title, body, grant_type, jurisdiction) VALUES (?, ?, ?, ?)'
);

// Index grants
for (const g of grants) {
  const body = [g.description, g.eligible_applicants, g.authority, g.budget].filter(Boolean).join(' ');
  insertIndex.run(g.name, body, g.grant_type, g.jurisdiction);
}

// Index grant items
for (const item of grantItems) {
  const parentGrant = grants.find(g => g.id === item.grant_id);
  const body = [item.description, item.specification, item.category].filter(Boolean).join(' ');
  insertIndex.run(item.name, body, parentGrant?.grant_type ?? '', item.jurisdiction);
}

// ─── METADATA ─────────────────────────────────────────────────────────────────

db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('last_ingest', ?)", [now]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('build_date', ?)", [now]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('grants_count', ?)", [String(grants.length)]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('items_count', ?)", [String(grantItems.length)]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('stacking_rules_count', ?)", [String(stackingRules.length)]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('guidance_steps_count', ?)", [String(applicationGuidance.length)]);

// ─── COVERAGE FILE ────────────────────────────────────────────────────────────

const ftsCount = db.get<{ c: number }>('SELECT count(*) as c FROM search_index')!.c;

writeFileSync('data/coverage.json', JSON.stringify({
  mcp_name: 'Sweden Farm Grants MCP',
  jurisdiction: 'SE',
  build_date: now,
  grants: grants.length,
  grant_items: grantItems.length,
  stacking_rules: stackingRules.length,
  application_guidance_steps: applicationGuidance.length,
  fts_entries: ftsCount,
}, null, 2));

db.close();

console.log(`\nIngestion complete:`);
console.log(`  Grants:              ${grants.length}`);
console.log(`  Grant items:         ${grantItems.length}`);
console.log(`  Stacking rules:      ${stackingRules.length}`);
console.log(`  Application steps:   ${applicationGuidance.length}`);
console.log(`  FTS index entries:   ${ftsCount}`);
console.log(`  Build date:          ${now}`);
