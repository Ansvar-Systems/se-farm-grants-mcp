/**
 * Sweden Farm Grants MCP — Data Ingestion Script
 *
 * Sources:
 *   - Jordbruksverket (Swedish Board of Agriculture) — investment grants, environmental payments,
 *     young farmer support, organic production, animal welfare, innovation (EIP-Agri)
 *   - Tillvaxtverket (Swedish Agency for Economic and Regional Growth) — rural development, digital
 *   - Lansstyrelsen (County Administrative Boards) — regional grants, predator protection, diversification
 *   - PTS (Post- and Telecom Authority) — broadband infrastructure
 *
 * Data verified against jordbruksverket.se, tillvaxtverket.se, pts.se (April 2026).
 *
 * Usage: npm run ingest
 */

import { createDatabase } from '../src/db.js';
import { mkdirSync, writeFileSync } from 'fs';

mkdirSync('data', { recursive: true });
const db = createDatabase('data/database.db');

const now = new Date().toISOString().split('T')[0];

// ─── GRANTS ─────────────────���───────────────────────────���─────────────────────

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
  // ─────────────── Jordbruksverket: Investment Support (Strategic Plan 2023-2027) ───────────────
  {
    id: 'investeringsstod-okad-konkurrenskraft',
    name: 'Investeringsstod — Okad konkurrenskraft',
    grant_type: 'capital',
    authority: 'Jordbruksverket',
    budget: '1200 MSEK',
    status: 'open',
    open_date: '2025-01-01',
    close_date: '2027-12-31',
    description: 'Investment support for agricultural, horticultural, and reindeer herding enterprises. Covers new or renovated livestock buildings, greenhouses, drying facilities, drain tiling, energy forest, ammonia-reducing measures, and innovative sustainable production technology. Standard support 30% of eligible costs; 40% in northern counties, for applicants 40 or younger, reindeer herding, and innovative tech; 80% for ammonia reduction. Minimum eligible investment 200,000 SEK (100,000 SEK for drainage, energy forest, reindeer herding). Decision processing approximately 5 months.',
    eligible_applicants: 'Operators of agricultural, horticultural, or reindeer herding enterprises investing in land and buildings. Horse breeding excluded. Must apply before starting the investment.',
    match_funding_pct: 30,
    max_grant_value: 4700000,
    jurisdiction: 'SE',
  },
  {
    id: 'investeringsstod-robust-primarproduktion',
    name: 'Investeringsstod — Robust primarproduktion',
    grant_type: 'capital',
    authority: 'Jordbruksverket',
    budget: '150 MSEK (2025)',
    status: 'open',
    open_date: '2025-01-01',
    close_date: '2027-12-31',
    description: 'Investment support to reduce vulnerability in food production. Covers resilience against power outages, water supply disruptions, transport disruptions, IT incidents/cyberattacks, critical input shortages, and theft/sabotage. Up to 65% of eligible costs for agriculture, 50% for fishing/aquaculture (80% for small-scale coastal fishing). Minimum eligible costs 50,000 SEK. 50% advance payment available. Must have operated in Sweden for at least 2 years (exception: young farmers under 40).',
    eligible_applicants: 'Primary producers in agriculture, horticulture, reindeer herding, fishing, and aquaculture with minimum 2 years operation in Sweden. Max 250 employees and 50 MEUR turnover.',
    match_funding_pct: 65,
    max_grant_value: 5000000,
    jurisdiction: 'SE',
  },
  {
    id: 'investeringsstod-kvaveklivet',
    name: 'Investeringsstod — Kvaveklivet',
    grant_type: 'capital',
    authority: 'Jordbruksverket',
    budget: '100 MSEK/year (2025-2027)',
    status: 'open',
    open_date: '2025-01-01',
    close_date: '2027-12-31',
    description: 'National investment support to reduce ammonia emissions and improve nitrogen utilization. Two tracks: (1) Ammonia reduction — up to 80% for agricultural enterprises, 50% for machine stations. Covers stable equipment, silage technology, manure storage/spreading, acid treatment (surgoring). (2) Efficient nitrogen utilization — 30% for both. Covers precision application technology, nitrogen sensors, section shutoff. 50% advance payment available up to 250,000 SEK.',
    eligible_applicants: 'Agricultural enterprises and machine stations (maskinstation). Must be micro, small, or medium-sized (max 250 employees, turnover max 50 MEUR). Apply via e-tjansten Projektstod.',
    match_funding_pct: 80,
    max_grant_value: null,
    jurisdiction: 'SE',
  },
  {
    id: 'investeringsstod-diversifiering',
    name: 'Investeringsstod — Diversifiering',
    grant_type: 'capital',
    authority: 'Jordbruksverket/Lansstyrelsen',
    budget: null,
    status: 'open',
    open_date: '2025-02-01',
    close_date: '2025-04-30',
    description: 'Investment support to diversify agricultural enterprises into non-agricultural activities (agritourism, farm shop, experience activities, contract work, care farming). 40% of eligible costs. Minimum investment 100,000 SEK, maximum support 800,000 SEK per three-year period. Investment must remain in use 5 years post-payment. Processing time approximately 6 months. Regional restrictions may apply.',
    eligible_applicants: 'Operators of agricultural, horticultural, or reindeer herding enterprises wanting to broaden into other activities. Horse breeding excluded.',
    match_funding_pct: 40,
    max_grant_value: 800000,
    jurisdiction: 'SE',
  },
  {
    id: 'investeringsstod-foradling',
    name: 'Investeringsstod — Foradling av jordbruksprodukter',
    grant_type: 'capital',
    authority: 'Jordbruksverket',
    budget: null,
    status: 'open',
    open_date: '2024-02-01',
    close_date: '2027-12-31',
    description: 'Investment support for processing agricultural products into food. Covers new construction, renovation, extensions of buildings and facilities, mobile processing equipment, food production machinery, services, and intangible investments. 40% of eligible costs, minimum 100,000 SEK, maximum 3,000,000 SEK eligible costs (max support 1,200,000 SEK per three-year period). 50% advance payment available up to 250,000 SEK. Products must be on the approved agricultural products list.',
    eligible_applicants: 'Agricultural, horticultural, and reindeer herding enterprises, plus small food production companies (max 50 employees, turnover/balance sheet under 10 MEUR).',
    match_funding_pct: 40,
    max_grant_value: 1200000,
    jurisdiction: 'SE',
  },
  {
    id: 'investeringsstod-vattenvardsatgarder',
    name: 'Investeringsstod — Vattenvardsatgarder',
    grant_type: 'environmental',
    authority: 'Jordbruksverket',
    budget: null,
    status: 'open',
    open_date: '2025-01-01',
    close_date: '2027-12-31',
    description: 'Investment support for water quality improvement measures on agricultural land. Covers wetland/pond creation or restoration, two-stage ditches (max 1,000 SEK/m), limestone filter beds, and other investments addressing eutrophication or physical water damage. Up to 100% of eligible costs. Minimum cost 30,000 SEK. Maximum 600,000 SEK/ha for wetlands. Processing time approximately 10 months. Annual management compensation for wetlands required after final payment.',
    eligible_applicants: 'Farmers, gardeners, reindeer herders, or companies implementing water quality investments on agricultural land. Must own land or have explicit landowner permission.',
    match_funding_pct: 100,
    max_grant_value: null,
    jurisdiction: 'SE',
  },
  {
    id: 'miljoinvestering-tvastegsdiken',
    name: 'Miljoinvestering — Tvastegsdiken',
    grant_type: 'environmental',
    authority: 'Jordbruksverket/Lansstyrelsen',
    budget: null,
    status: 'open',
    open_date: '2025-01-01',
    close_date: '2027-12-31',
    description: 'Environmental investment for construction of two-stage ditches (tvastegsdiken) to reduce nitrogen and phosphorus transport from agricultural land. Maximum 1,000 SEK per meter. Minimum eligible costs 30,000 SEK. Covers excavation, embankment shaping, and outlet structures. Must be implemented with consideration for natural and cultural environment values at the location.',
    eligible_applicants: 'Landowners and tenants with long-term lease agreement. Investment must be on agricultural land.',
    match_funding_pct: 100,
    max_grant_value: null,
    jurisdiction: 'SE',
  },
  {
    id: 'miljoinvestering-vatmark',
    name: 'Miljoinvestering — Vatmark och damm',
    grant_type: 'environmental',
    authority: 'Jordbruksverket/Lansstyrelsen',
    budget: '250 MSEK',
    status: 'open',
    open_date: '2025-01-01',
    close_date: '2027-12-31',
    description: 'Environmental investment for wetland and pond creation or restoration for nutrient reduction and biodiversity. Up to 100% of eligible costs for nutrient reduction purpose, up to 50% for biodiversity purpose. Maximum 600,000 SEK per hectare of water surface. Covers excavation, embankments, inlet/outlet structures, and design fees. Requires environmental permit (miljobalken 11 kap) from Lansstyrelsen. Must secure annual wetland management compensation after final payment.',
    eligible_applicants: 'Landowners and tenants with long-term lease. Wetland must be in agricultural landscape. Priority for catchment areas with high nutrient loads.',
    match_funding_pct: 100,
    max_grant_value: null,
    jurisdiction: 'SE',
  },
  {
    id: 'miljoinvestering-kulturmiljo',
    name: 'Miljoinvestering — Natur- och kulturmiljoer',
    grant_type: 'environmental',
    authority: 'Jordbruksverket/Lansstyrelsen',
    budget: null,
    status: 'closed',
    open_date: null,
    close_date: '2025-04-05',
    description: 'Investment support for restoring and preserving nature and cultural environments in cultivated landscapes and reindeer herding areas. Up to 90% of eligible costs. Minimum costs 50,000 SEK. Must be in rural areas or towns with max 3,000 inhabitants. Programme closed for new applications; existing projects must complete by April 5, 2025.',
    eligible_applicants: 'Authorities, municipalities, regions, companies, associations, and organizations. Investment must be in rural areas.',
    match_funding_pct: 90,
    max_grant_value: null,
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
    description: 'Predator-proof fencing for livestock protection. Electric fencing against wolf, lynx, bear. Up to 100% in reindeer husbandry areas, up to 80% elsewhere. Covers 5-wire electric fencing, posts, wire, energiser, portable night enclosures. Application and administration handled by the relevant county administrative board (Lansstyrelsen).',
    eligible_applicants: 'Livestock keepers in areas with documented predator presence. Apply to the relevant county administrative board (Lansstyrelsen).',
    match_funding_pct: 100,
    max_grant_value: null,
    jurisdiction: 'SE',
  },

  // ─────────────── Jordbruksverket: Young Farmer / Start-up ───────────────
  {
    id: 'startstod',
    name: 'Startstod',
    grant_type: 'young_farmer',
    authority: 'Jordbruksverket',
    budget: '100 MSEK',
    status: 'open',
    open_date: '2025-01-01',
    close_date: '2027-12-31',
    description: 'Lump sum start-up grant for first-time farmers aged 40 or younger. 150,000 SEK for part-time (min 860 hours/year) or 300,000 SEK for full-time (min 1,720 hours/year). Paid in two installments: 2/3 initially, 1/3 at final payment. Must create 3-5 year business plan and begin implementation within 9 months. Agricultural income must reach at least 1/3 of total company income by final payment. For reindeer herding: requires 3-year mentor and active sameby membership. Apply within 24 months of meeting eligibility criteria.',
    eligible_applicants: 'First-time farmers aged 40 or younger. Must have upper secondary diploma OR min 12 months full-time agricultural experience. Physical persons only (not legal entities).',
    match_funding_pct: null,
    max_grant_value: 300000,
    jurisdiction: 'SE',
  },
  {
    id: 'stod-unga-jordbrukare',
    name: 'Stod till unga jordbrukare',
    grant_type: 'young_farmer',
    authority: 'Jordbruksverket',
    budget: null,
    status: 'open',
    open_date: '2025-01-01',
    close_date: '2027-12-31',
    description: 'Annual per-hectare top-up for young farmers. Approximately 85-159 EUR/ha depending on application volume (2025 reference: 140 EUR/ha). Applied via SAM-ansokan. Must be first-time farmer, 40 or younger, operating min 4 ha. Available max 5 years from first application. Requires active farmer classification (min 36 ha, or min 50 animal units, or max 5,000 EUR in direct payments).',
    eligible_applicants: 'First-time farmers aged 40 or younger, operating min 4 ha of agricultural land. Must meet active farmer criteria. Upper secondary diploma or 12 months experience required.',
    match_funding_pct: null,
    max_grant_value: null,
    jurisdiction: 'SE',
  },

  // ─────────────── Jordbruksverket: Environmental Payments (SAM) ───────────────
  {
    id: 'ersattning-ekologisk-produktion',
    name: 'Ersattning for ekologisk produktion',
    grant_type: 'environmental',
    authority: 'Jordbruksverket',
    budget: null,
    status: 'open',
    open_date: '2025-01-01',
    close_date: '2027-12-31',
    description: 'Annual compensation for certified organic production. Rates (2026 planned, EUR/ha): cereals/oilseeds/protein crops 147 (range 132-162); potatoes/sugar beets/vegetables 492 (range 443-541); fruit and berries 737 (range 663-811); livestock 177 (range 159-195) per ha linked to grassland. One-year commitment, annual application via SAM Internet. Min 4 ha, min 0.1 ha per field. Must be certified organic (or in conversion) by approved certification body. Exchange rate 2025: 1 EUR = 11.06 SEK.',
    eligible_applicants: 'Certified organic producers or farmers in conversion. Min 4 ha farmland. Must be classified as active farmer. Register with certification body by April 9 each year.',
    match_funding_pct: 100,
    max_grant_value: null,
    jurisdiction: 'SE',
  },
  {
    id: 'djurvalfardsersattning-mjolkkor',
    name: 'Djurvalfardsersattning for mjolkkor',
    grant_type: 'environmental',
    authority: 'Jordbruksverket',
    budget: null,
    status: 'open',
    open_date: '2025-01-01',
    close_date: '2027-12-31',
    description: 'Animal welfare compensation for dairy cows. 1,300 SEK per animal unit (1 dairy cow or heifer over 24 months = 1 unit). Minimum payout 1,000 SEK. From 2026, requires both hoof health AND grazing conditions. Hoof health: inspect and trim hooves min 2 times/year (3+ months apart) by certified specialist; create hoof health plan. Grazing: keep cows on pasture for legally required number of days. Apply via SAM Internet.',
    eligible_applicants: 'Dairy farmers with dairy cows or heifers over 24 months. Animals must be registered in CDB (cattle registry). Must follow ground conditions for animal welfare, environmental, and social requirements.',
    match_funding_pct: null,
    max_grant_value: null,
    jurisdiction: 'SE',
  },
  {
    id: 'djurvalfardsersattning-far',
    name: 'Djurvalfardsersattning for far',
    grant_type: 'environmental',
    authority: 'Jordbruksverket',
    budget: null,
    status: 'open',
    open_date: '2025-01-01',
    close_date: '2027-12-31',
    description: 'Animal welfare compensation for sheep. Covers extra animal welfare measures beyond legal minimum requirements. Applied via SAM Internet. Requirements include parasite management plan and documented health monitoring. Compensation per animal unit.',
    eligible_applicants: 'Sheep farmers with registered flocks. Must maintain animal welfare documentation and follow veterinary parasite management protocols.',
    match_funding_pct: null,
    max_grant_value: null,
    jurisdiction: 'SE',
  },
  {
    id: 'notkreatursstod',
    name: 'Notkreatursstod',
    grant_type: 'environmental',
    authority: 'Jordbruksverket',
    budget: null,
    status: 'open',
    open_date: '2025-08-01',
    close_date: '2026-07-31',
    description: 'Coupled income support for cattle. Compensation for all cattle over 1 year old held during the calculation period (August 1 to July 31). Amount varies between 87-96 EUR per animal unit per calculation period. Applied via SAM-ansokan. Aims to maintain beef and dairy cattle production in Sweden.',
    eligible_applicants: 'Cattle farmers with animals over 1 year old, registered in CDB. Must hold animals during the calculation period.',
    match_funding_pct: null,
    max_grant_value: null,
    jurisdiction: 'SE',
  },
  {
    id: 'miljoersattning-vallodling',
    name: 'Miljoersattning for vallodling',
    grant_type: 'environmental',
    authority: 'Jordbruksverket',
    budget: null,
    status: 'planned',
    open_date: '2026-02-01',
    close_date: '2027-12-31',
    description: 'Environmental compensation for grassland/ley cultivation. New one-year scheme from 2026 replacing the previous 5-year commitment. Planned amount 54 EUR/ha (range 49-59 EUR/ha depending on uptake). Applied via SAM Internet. Not available for 2025 applications. Promotes soil health, nutrient retention, and biodiversity in crop rotations.',
    eligible_applicants: 'Active farmers with registered ley (vall) fields in SAM-ansokan. Min 0.1 ha per field.',
    match_funding_pct: null,
    max_grant_value: null,
    jurisdiction: 'SE',
  },
  {
    id: 'miljoersattning-betesmarker',
    name: 'Miljoersattning for betesmarker och slatterangar',
    grant_type: 'environmental',
    authority: 'Jordbruksverket',
    budget: null,
    status: 'open',
    open_date: '2025-01-01',
    close_date: '2027-12-31',
    description: 'Environmental compensation for management of pastures and hay meadows. Multi-year commitment (5 years). Applied via SAM Internet. Must apply for all committed fields in the first year. Min 0.1 ha per field. Includes complement payments for extra management measures (e.g., late mowing, no fertilizer). Supports biodiversity and cultural landscape preservation.',
    eligible_applicants: 'Active farmers with pasture or hay meadow fields registered in SAM. Must maintain grazing or mowing according to management plan.',
    match_funding_pct: null,
    max_grant_value: null,
    jurisdiction: 'SE',
  },

  // ─────────────── Jordbruksverket: EIP-Agri Innovation ────���──────────
  {
    id: 'eip-agri-innovationsgrupp',
    name: 'EIP-Agri — Stod for innovationsgrupp',
    grant_type: 'competitive',
    authority: 'Jordbruksverket',
    budget: null,
    status: 'rolling',
    open_date: '2025-01-01',
    close_date: null,
    description: 'Lump sum support for forming an EIP-Agri innovation group. 80,000 SEK for groups of 2-4 organizations, 120,000 SEK for groups of 5 or more. Group must have signed cooperation agreement and include at least 2 organizations with complementary competencies (primary producers, researchers, advisors). Prerequisite for applying for full innovation project funding.',
    eligible_applicants: 'Groups of 2+ organizations, including at least 1 primary producer and 1 researcher or advisor. Lead applicant must be a legal entity. Contact Landsbygdsnatverket before applying.',
    match_funding_pct: 100,
    max_grant_value: 120000,
    jurisdiction: 'SE',
  },
  {
    id: 'eip-agri-innovationsprojekt',
    name: 'EIP-Agri — Innovationsprojekt',
    grant_type: 'competitive',
    authority: 'Jordbruksverket',
    budget: '80 MSEK',
    status: 'rolling',
    open_date: '2025-01-01',
    close_date: null,
    description: 'Support for collaborative EIP-Agri innovation projects. Personnel costs 100%, indirect costs 15% of wages, other eligible expenses 100%, investments 50%. Sole proprietors: 340 SEK/hour. Advance payment max 250,000 SEK (50% of total). Decision rounds quarterly (March 31, June 30, September 30, December 11 for 2026). Processing approximately 6 months. Final payment deadline April 6, 2029. Must investigate freedom to operate (patents/trademarks).',
    eligible_applicants: 'Companies, associations, municipalities, regions, authorities, and organizations (not private persons). Must have formed innovation group with signed cooperation agreement. Min 2 organizations with min 2 competency types.',
    match_funding_pct: 100,
    max_grant_value: 4000000,
    jurisdiction: 'SE',
  },

  // ─────────────── Jordbruksverket: Competence & Cooperation ───────────────
  {
    id: 'kompetensutveckling',
    name: 'Kompetensutveckling',
    grant_type: 'revenue',
    authority: 'Jordbruksverket',
    budget: '120 MSEK',
    status: 'rolling',
    open_date: '2025-01-01',
    close_date: null,
    description: 'Support for organizing competence development activities for farmers. 100% of eligible costs. Covers information initiatives, advisory services, and training courses. Three thematic areas: (1) Strengthened competitiveness and improved animal welfare, (2) Environment and climate, (3) Food and tourism. Applications scored up to 1,000 points. Administered via open calls or procurement bids. Note: individual farmers cannot apply directly — they participate in activities organized by approved providers.',
    eligible_applicants: 'Companies, organizations, public agencies, municipalities, and associations organizing training or advisory activities. Individual farmers participate through approved providers.',
    match_funding_pct: 100,
    max_grant_value: null,
    jurisdiction: 'SE',
  },
  {
    id: 'samarbetsstod',
    name: 'Samarbetsstod — Korta leveranskedjor',
    grant_type: 'competitive',
    authority: 'Jordbruksverket',
    budget: '60 MSEK',
    status: 'rolling',
    open_date: '2025-01-01',
    close_date: null,
    description: 'Support for cooperation projects between farmers. Short supply chains, local markets, joint processing. Up to 70% of cooperation costs. Min 2 farmers or agricultural enterprises cooperating on a joint project. Covers coordination, market development, joint logistics, and shared processing facilities. Must benefit primary production.',
    eligible_applicants: 'Groups of at least 2 farmers or agricultural enterprises cooperating on a joint project. Must benefit primary production.',
    match_funding_pct: 70,
    max_grant_value: 2000000,
    jurisdiction: 'SE',
  },

  // ─────────────── Jordbruksverket: Leader ───────────────
  {
    id: 'leader-projektstod',
    name: 'Leader — Projektstod for lokal utveckling',
    grant_type: 'competitive',
    authority: 'Jordbruksverket',
    budget: '1700 MSEK (2023-2027)',
    status: 'open',
    open_date: '2023-01-01',
    close_date: '2027-12-31',
    description: 'Locally led development through the Leader method. 1.7 billion SEK for 2023-2027. Public benefit projects: 40-100% of eligible costs. Commercial projects: 40-70%, max 300,000 SEK. Covers investments (min 24,000 SEK ex VAT, 3+ year lifespan), personnel, equipment, materials, travel, indirect costs (15% overhead on wages), consultation fees. Processing time approximately 11 months. Projects must align with the local Leader area development strategy.',
    eligible_applicants: 'Municipalities, regions, associations, organizations, and companies contributing to development in a Leader area. Contact local Leader office before applying.',
    match_funding_pct: 100,
    max_grant_value: null,
    jurisdiction: 'SE',
  },

  // ─────────────── Broadband ─────��─────────
  {
    id: 'bredbandsstod',
    name: 'Bredbandsstod',
    grant_type: 'infrastructure',
    authority: 'PTS',
    budget: '813 MSEK (2024), ~1250 MSEK sought (2025)',
    status: 'open',
    open_date: '2025-01-01',
    close_date: '2027-12-31',
    description: 'Broadband infrastructure to rural areas lacking commercial coverage. Fiber-to-premises. Government plans broadband support for 2025, 2026 and 2027, distributed between Norrland, Svealand, and Gotaland. Max 60% of eligible construction costs. 2025 allocation: 9,228 households, workplaces and vacation homes connected. Coordination with Jordbruksverket and Tillvaxtverket to prevent double financing.',
    eligible_applicants: 'Municipalities, broadband associations (fiberforeningar), and other legal entities building broadband in rural areas. Must demonstrate area lacks commercial broadband coverage.',
    match_funding_pct: 60,
    max_grant_value: null,
    jurisdiction: 'SE',
  },

  // ─────────────── Tillvaxtverket: Rural Development ───────────────
  {
    id: 'projektstod-landsbygdsutveckling',
    name: 'Projektstod — Landsbygdsutveckling',
    grant_type: 'competitive',
    authority: 'Tillvaxtverket/Lansstyrelsen',
    budget: '400 MSEK',
    status: 'rolling',
    open_date: '2025-01-01',
    close_date: null,
    description: 'Rural development projects: farm shops, agritourism, local food processing, rural services. Max 50% of eligible project costs. Application through Jordbruksverkets e-tjanst. Covers project costs, personnel, travel, materials. Must create lasting value in rural areas.',
    eligible_applicants: 'Farmers, small enterprises, non-profits, and municipalities in rural areas. Project must benefit rural development and create lasting value.',
    match_funding_pct: 50,
    max_grant_value: 3000000,
    jurisdiction: 'SE',
  },
  {
    id: 'digital-mognad-landsbygd',
    name: 'Digitalisering sma foretag i landsbygder',
    grant_type: 'competitive',
    authority: 'Tillvaxtverket',
    budget: '22.5 MSEK',
    status: 'closed',
    open_date: '2021-01-01',
    close_date: '2025-12-31',
    description: 'Support for digital maturity in small rural enterprises. 21 collaboration projects financed through the EU rural development programme. Target: 1,300 enterprises across tourism, creative industries, food sector, forestry, agriculture, construction, and small industrial suppliers. Projects concluded December 2024. New round may open under next programme period.',
    eligible_applicants: 'Small enterprises in rural areas, with focus on tourism, creative industries, food, agriculture, forestry, construction, and industrial suppliers.',
    match_funding_pct: null,
    max_grant_value: null,
    jurisdiction: 'SE',
  },
  {
    id: 'service-landsbygder',
    name: 'Stod for kommersiell service i landsbygder',
    grant_type: 'infrastructure',
    authority: 'Tillvaxtverket',
    budget: '11 MSEK',
    status: 'open',
    open_date: '2024-01-01',
    close_date: '2025-03-31',
    description: 'Support for commercial service accessibility in rural areas. Financed through Landsbygdsprogrammet. 23 municipalities working with service development. Covers process management for local service solutions — grocery stores, fuel stations, pharmacies, postal services in sparsely populated areas.',
    eligible_applicants: 'Municipalities in rural areas working with service accessibility. Selection by Tillvaxtverket.',
    match_funding_pct: null,
    max_grant_value: null,
    jurisdiction: 'SE',
  },

  // ─────────────── Lansstyrelsen: Regional ──��────────────
  {
    id: 'regionalt-investeringsstod',
    name: 'Regionalt investeringsstod',
    grant_type: 'capital',
    authority: 'Lansstyrelsen',
    budget: null,
    status: 'open',
    open_date: '2025-01-01',
    close_date: null,
    description: 'Regional investment support administered by county administrative boards. Covers regional calls for ökad konkurrenskraft (e.g., Skane: 30 MSEK, deadline April 30 2025; Vastra Gotaland: 15 MSEK, deadline May 31 2025). Specialized calls for cattle buildings (80 MSEK national budget, August-September 2025). Support levels, scoring criteria, and minimum thresholds vary by region.',
    eligible_applicants: 'Agricultural, horticultural, and reindeer herding enterprises in the relevant county. Check with your Lansstyrelse for region-specific calls and deadlines.',
    match_funding_pct: 40,
    max_grant_value: null,
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

// ─── GRANT ITEMS ───────────────��──────────────────────────────────────────────

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
  // ── Okad konkurrenskraft items ──
  { id: 'okk-01', grant_id: 'investeringsstod-okad-konkurrenskraft', item_code: 'OK-001', name: 'Ny mjolkladugard', description: 'New dairy barn construction including concrete foundation, steel frame, roofing, and interior fittings. Must include ventilation per SJV animal welfare regulations.', specification: 'Min 50 djurplatser, ventilation per SJVFS 2019:18', grant_value: 45000, grant_unit: 'SEK/djurplats', category: 'building', jurisdiction: 'SE' },
  { id: 'okk-02', grant_id: 'investeringsstod-okad-konkurrenskraft', item_code: 'OK-002', name: 'Renovering befintlig ladugard', description: 'Renovation of existing livestock barn: structural repairs, new roofing, insulation upgrade, updated ventilation.', specification: 'Byggnaden maste vara aldre an 15 ar', grant_value: 25000, grant_unit: 'SEK/djurplats', category: 'building', jurisdiction: 'SE' },
  { id: 'okk-03', grant_id: 'investeringsstod-okad-konkurrenskraft', item_code: 'OK-003', name: 'Vaxthus nybygge', description: 'Greenhouse new construction: glass or polycarbonate, heating system, climate control, growing tables/gutter systems.', specification: 'Min 200 m2 odlingsyta', grant_value: 3000, grant_unit: 'SEK/m2', category: 'building', jurisdiction: 'SE' },
  { id: 'okk-04', grant_id: 'investeringsstod-okad-konkurrenskraft', item_code: 'OK-004', name: 'Torkanlaggning', description: 'Crop drying facility: continuous flow dryer or batch dryer, storage bins, conveyor systems.', specification: 'Min 10 ton/timme kapacitet', grant_value: 800000, grant_unit: 'SEK', category: 'equipment', jurisdiction: 'SE' },
  { id: 'okk-05', grant_id: 'investeringsstod-okad-konkurrenskraft', item_code: 'OK-005', name: 'Tackdikning', description: 'Drain tile installation including tile, gravel, excavation, and lime filter where applicable. Minimum investment 100,000 SEK.', specification: 'Min 100,000 SEK investering', grant_value: 35000, grant_unit: 'SEK/ha', category: 'drainage', jurisdiction: 'SE' },
  { id: 'okk-06', grant_id: 'investeringsstod-okad-konkurrenskraft', item_code: 'OK-006', name: 'Energiskog (salix/poppel)', description: 'Energy forest plantation: Salix, hybrid aspen, or poplar. Covers plants, planting, and establishment.', specification: 'Min 100,000 SEK investering, min 2 ha', grant_value: 15000, grant_unit: 'SEK/ha', category: 'planting', jurisdiction: 'SE' },
  { id: 'okk-07', grant_id: 'investeringsstod-okad-konkurrenskraft', item_code: 'OK-007', name: 'Tak pa godselbrunn (ammoniakreduktion)', description: 'Roofing/covering of manure storage to reduce ammonia emissions. Concrete cover, tent cover, or floating cover. 80% support level.', specification: 'Tackning kravs, 8 manaders lagringskapacitet', grant_value: 300, grant_unit: 'SEK/m3', category: 'manure', jurisdiction: 'SE' },
  { id: 'okk-08', grant_id: 'investeringsstod-okad-konkurrenskraft', item_code: 'OK-008', name: 'Innovativ hallbar teknik', description: 'Innovative sustainable production technology new to the Swedish market within 2 years. 40% support. Must demonstrate sustainability improvement.', specification: 'Ny pa svenska marknaden inom 2 ar', grant_value: null, grant_unit: 'SEK', category: 'innovation', jurisdiction: 'SE' },
  { id: 'okk-09', grant_id: 'investeringsstod-okad-konkurrenskraft', item_code: 'OK-009', name: 'Mjolkningsutrustning', description: 'Milking parlour or automatic milking system (VMS/robot) installation including plumbing and electrical.', specification: 'VMS eller karusell for min 60 kor', grant_value: 1200000, grant_unit: 'SEK', category: 'equipment', jurisdiction: 'SE' },
  { id: 'okk-10', grant_id: 'investeringsstod-okad-konkurrenskraft', item_code: 'OK-010', name: 'Ventilationssystem stallar', description: 'Climate control and ventilation system for livestock buildings per animal welfare regulations.', specification: 'Per SJVFS 2019:18 djurskyddsforeskrifter', grant_value: 150000, grant_unit: 'SEK', category: 'equipment', jurisdiction: 'SE' },
  { id: 'okk-11', grant_id: 'investeringsstod-okad-konkurrenskraft', item_code: 'OK-011', name: 'Godselforrad betong', description: 'Concrete manure storage tank. Must meet 8-month storage capacity requirement. Includes pump system.', specification: '8 manaders lagringskapacitet, tackning kravs', grant_value: 350, grant_unit: 'SEK/m3', category: 'manure', jurisdiction: 'SE' },
  { id: 'okk-12', grant_id: 'investeringsstod-okad-konkurrenskraft', item_code: 'OK-012', name: 'Renvaktarstuga', description: 'Reindeer herder cabin for use during reindeer herding activities. Includes basic accommodation and equipment storage.', specification: 'For rennaring, 40% stod', grant_value: 500000, grant_unit: 'SEK', category: 'building', jurisdiction: 'SE' },

  // ── Robust primarproduktion items ──
  { id: 'rob-01', grant_id: 'investeringsstod-robust-primarproduktion', item_code: 'RP-001', name: 'Reservkraft generator', description: 'Backup power generator for farm operations. Diesel or gas. Must be capable of sustaining critical farm systems (ventilation, milking, feeding).', specification: 'Min 50 kVA, automatisk overgang', grant_value: 500000, grant_unit: 'SEK', category: 'power', jurisdiction: 'SE' },
  { id: 'rob-02', grant_id: 'investeringsstod-robust-primarproduktion', item_code: 'RP-002', name: 'Batterilagring for driftsakerhet', description: 'Battery storage system for farm power resilience. Must support grid-disconnection capability. Paired with renewable energy.', specification: 'Min 20 kWh, frankopling fran nat kravs', grant_value: 5000, grant_unit: 'SEK/kWh', category: 'power', jurisdiction: 'SE' },
  { id: 'rob-03', grant_id: 'investeringsstod-robust-primarproduktion', item_code: 'RP-003', name: 'Reservvatten djurproduktion', description: 'Backup water supply system for livestock production: bore well, water tank, pumping equipment.', specification: 'Min 3 dagars vattenreserv', grant_value: 400000, grant_unit: 'SEK', category: 'water', jurisdiction: 'SE' },
  { id: 'rob-04', grant_id: 'investeringsstod-robust-primarproduktion', item_code: 'RP-004', name: 'IT-sakerhet och overvakning', description: 'Farm IT security: network segmentation, monitoring cameras, access control, backup systems for farm management software.', specification: 'Brandvagg, overvakning, backup', grant_value: 200000, grant_unit: 'SEK', category: 'it_security', jurisdiction: 'SE' },
  { id: 'rob-05', grant_id: 'investeringsstod-robust-primarproduktion', item_code: 'RP-005', name: 'Lagringskapacitet insatsvaror', description: 'Storage capacity for critical farm inputs (feed, fuel, fertilizer) to reduce vulnerability to transport disruptions.', specification: 'Min 4 veckors lagerhallning', grant_value: 600000, grant_unit: 'SEK', category: 'storage', jurisdiction: 'SE' },
  { id: 'rob-06', grant_id: 'investeringsstod-robust-primarproduktion', item_code: 'RP-006', name: 'Stoldskydd och sabotageskydd', description: 'Anti-theft and sabotage protection: perimeter fencing, alarm system, GPS tracking for equipment.', specification: 'Larmcentral-anslutning kravs', grant_value: 300000, grant_unit: 'SEK', category: 'security', jurisdiction: 'SE' },

  // ── Kvaveklivet items ──
  { id: 'kvv-01', grant_id: 'investeringsstod-kvaveklivet', item_code: 'KV-001', name: 'Surgoring godsel (ammoniak)', description: 'Acid treatment system for manure to reduce ammonia emissions. Covers dosing equipment, acid tank, safety systems.', specification: 'Svavelsyra dosering, pH <6', grant_value: null, grant_unit: 'SEK', category: 'ammonia', jurisdiction: 'SE' },
  { id: 'kvv-02', grant_id: 'investeringsstod-kvaveklivet', item_code: 'KV-002', name: 'Godselspridningsutrustning', description: 'Efficient manure spreading equipment: trailing hose, injection system, band spreader. Reduces ammonia loss during application.', specification: 'Myllnings- eller bandspridningsteknik', grant_value: null, grant_unit: 'SEK', category: 'ammonia', jurisdiction: 'SE' },
  { id: 'kvv-03', grant_id: 'investeringsstod-kvaveklivet', item_code: 'KV-003', name: 'Kvavesensor precisionsgodsling', description: 'Nitrogen sensor for precision fertilization (e.g., Yara N-Sensor, CropSAT). 30% support under nitrogen utilization track.', specification: 'ISOBUS-kompatibel, variabel givning', grant_value: null, grant_unit: 'SEK', category: 'precision', jurisdiction: 'SE' },
  { id: 'kvv-04', grant_id: 'investeringsstod-kvaveklivet', item_code: 'KV-004', name: 'Sektionsavstangning godselspridare', description: 'Section shutoff for fertilizer spreader. GPS-controlled to prevent overlap and reduce nitrogen waste.', specification: 'Min 5 sektioner, GPS-baserad', grant_value: null, grant_unit: 'SEK', category: 'precision', jurisdiction: 'SE' },
  { id: 'kvv-05', grant_id: 'investeringsstod-kvaveklivet', item_code: 'KV-005', name: 'Silage-teknik (slangsilo)', description: 'Improved silage technology: tube wrapping, oxygen-barrier film, pressed bale wrapping. Reduces nitrogen losses in feed conservation.', specification: 'Syrefri lagring, forlustminskning', grant_value: null, grant_unit: 'SEK', category: 'ammonia', jurisdiction: 'SE' },

  // ── Diversifiering items ──
  { id: 'div-01', grant_id: 'investeringsstod-diversifiering', item_code: 'DV-001', name: 'Gardsbutik', description: 'Farm shop construction or renovation: retail space, cold storage, display equipment, point-of-sale system.', specification: 'Livsmedelshantering krav', grant_value: 800000, grant_unit: 'SEK', category: 'building', jurisdiction: 'SE' },
  { id: 'div-02', grant_id: 'investeringsstod-diversifiering', item_code: 'DV-002', name: 'Turistboende/stuga', description: 'Agritourism accommodation: cabin, B&B room, glamping unit. Must be linked to agricultural enterprise.', specification: 'Max 800,000 SEK stod per 3-arsperiod', grant_value: 800000, grant_unit: 'SEK', category: 'building', jurisdiction: 'SE' },
  { id: 'div-03', grant_id: 'investeringsstod-diversifiering', item_code: 'DV-003', name: 'Upplevelseanlaggning', description: 'Experience/activity facility: riding arena, nature trail, event space. Must diversify farm income.', specification: 'Kopplat till jordbruksverksamhet', grant_value: 500000, grant_unit: 'SEK', category: 'building', jurisdiction: 'SE' },

  // ── Foradling items ──
  { id: 'for-01', grant_id: 'investeringsstod-foradling', item_code: 'FD-001', name: 'Livsmedelslokal nybygge', description: 'New food processing premises: walls, floors (food-grade), drainage, ventilation, cooling, hygiene zones.', specification: 'Livsmedelsverket-godkand lokal', grant_value: 1200000, grant_unit: 'SEK', category: 'building', jurisdiction: 'SE' },
  { id: 'for-02', grant_id: 'investeringsstod-foradling', item_code: 'FD-002', name: 'Produktionsutrustning livsmedel', description: 'Food production machinery: pasteurizer, packaging line, cutting equipment, smoking chamber, cheese press, juice press.', specification: 'Min 100,000 SEK stodberattigande', grant_value: 800000, grant_unit: 'SEK', category: 'equipment', jurisdiction: 'SE' },
  { id: 'for-03', grant_id: 'investeringsstod-foradling', item_code: 'FD-003', name: 'Mobil foradlingsenhet', description: 'Mobile food processing unit: mobile slaughter unit, mobile dairy, mobile juice press. Enables on-farm processing.', specification: 'Livsmedelsverket-godkand', grant_value: 1000000, grant_unit: 'SEK', category: 'equipment', jurisdiction: 'SE' },

  // ── Vattenvardsatgarder items ──
  { id: 'vat-01', grant_id: 'investeringsstod-vattenvardsatgarder', item_code: 'VA-001', name: 'Vatmarksanlaggning', description: 'Wetland construction: excavation, embankments, inlet/outlet structures. For nutrient reduction or biodiversity.', specification: 'Min 0.5 ha vattenyta, max 10 ha', grant_value: 600000, grant_unit: 'SEK/ha', category: 'construction', jurisdiction: 'SE' },
  { id: 'vat-02', grant_id: 'investeringsstod-vattenvardsatgarder', item_code: 'VA-002', name: 'Kalkfilterdike', description: 'Limestone filter bed to capture phosphorus from agricultural runoff. Reactive material, collection/distribution systems.', specification: 'Reaktivt filtermaterial, fosforfallning', grant_value: null, grant_unit: 'SEK', category: 'construction', jurisdiction: 'SE' },
  { id: 'vat-03', grant_id: 'investeringsstod-vattenvardsatgarder', item_code: 'VA-003', name: 'Bevattningsdamm', description: 'Irrigation reservoir for water storage and buffering. Covers excavation, embankments, liner.', specification: 'Min 5,000 m3 kapacitet', grant_value: 120, grant_unit: 'SEK/m3', category: 'water_storage', jurisdiction: 'SE' },

  // ── Tvastegsdiken items ─���
  { id: 'tsd-01', grant_id: 'miljoinvestering-tvastegsdiken', item_code: 'TD-001', name: 'Tvastegsdike anlaggning', description: 'Two-stage ditch excavation: widened upper shelf with vegetation zone for nutrient uptake. Max 1,000 SEK/m.', specification: 'Min 30,000 SEK totalutgift', grant_value: 1000, grant_unit: 'SEK/m', category: 'construction', jurisdiction: 'SE' },
  { id: 'tsd-02', grant_id: 'miljoinvestering-tvastegsdiken', item_code: 'TD-002', name: 'Utloppsanordning', description: 'Outlet structure for two-stage ditch: adjustable water level control, erosion protection.', specification: null, grant_value: 30000, grant_unit: 'SEK', category: 'construction', jurisdiction: 'SE' },

  // ── Stangsel items ──
  { id: 'rovd-01', grant_id: 'miljoinvestering-stangsel', item_code: 'RS-001', name: 'Elstangsel 5-trad', description: 'Five-wire electric fence against wolf and bear. Includes posts, wire, energiser, grounding.', specification: 'Min 5 tradar, min 4,500V, jordning per SJV', grant_value: 75, grant_unit: 'SEK/m', category: 'fencing', jurisdiction: 'SE' },
  { id: 'rovd-02', grant_id: 'miljoinvestering-stangsel', item_code: 'RS-002', name: 'Nattfalla for far/get', description: 'Portable night enclosure for sheep and goats in predator areas.', specification: 'Min 90 cm hojd, dubbelgrindar', grant_value: 35000, grant_unit: 'SEK', category: 'fencing', jurisdiction: 'SE' },

  // ── Robust primarproduktion: solceller (resilience, not energy per se) ─���
  { id: 'rob-07', grant_id: 'investeringsstod-robust-primarproduktion', item_code: 'RP-007', name: 'Solcellsanlaggning (driftsakerhet)', description: 'Solar panel installation for farm resilience. Paired with battery for off-grid capability. Cannot exceed annual consumption.', specification: 'Min 10 kW, med batterilagring och frankopling', grant_value: 8000, grant_unit: 'SEK/kW', category: 'power', jurisdiction: 'SE' },

  // ── Leader items ──
  { id: 'ldr-01', grant_id: 'leader-projektstod', item_code: 'LD-001', name: 'Investeringskostnad (Leader)', description: 'Physical investment with 3+ year lifespan under Leader project. Min 24,000 SEK ex VAT.', specification: 'Min 24,000 SEK exkl moms, 3 ars livslangd', grant_value: null, grant_unit: 'SEK', category: 'investment', jurisdiction: 'SE' },
  { id: 'ldr-02', grant_id: 'leader-projektstod', item_code: 'LD-002', name: 'Personalkostnad (Leader)', description: 'Personnel cost for Leader project: wages, social charges. Indirect cost 15% overhead on wages.', specification: '15% OH pa lonekostnader', grant_value: null, grant_unit: 'SEK', category: 'personnel', jurisdiction: 'SE' },

  // ── Broadband items ──
  { id: 'bbd-01', grant_id: 'bredbandsstod', item_code: 'BB-001', name: 'Fiberanslutning landsbygd', description: 'Fiber-to-premises: trenching, ducting, fiber cable, splicing, ONT installation per household.', specification: 'Min 100 Mbit/s symmetrisk', grant_value: null, grant_unit: 'SEK/anslutning', category: 'fiber', jurisdiction: 'SE' },
  { id: 'bbd-02', grant_id: 'bredbandsstod', item_code: 'BB-002', name: 'Stamnatsanslutning', description: 'Backbone network connection: node housing, active equipment, dark fiber lease or build.', specification: null, grant_value: null, grant_unit: 'SEK', category: 'fiber', jurisdiction: 'SE' },

  // ── EIP-Agri items ──
  { id: 'eip-01', grant_id: 'eip-agri-innovationsprojekt', item_code: 'EI-001', name: 'Personalkostnad (EIP)', description: 'Full wage costs for project work. 100% support. Sole proprietors: 340 SEK/hour.', specification: '100% stod, enskild firma 340 SEK/h', grant_value: null, grant_unit: 'SEK', category: 'personnel', jurisdiction: 'SE' },
  { id: 'eip-02', grant_id: 'eip-agri-innovationsprojekt', item_code: 'EI-002', name: 'Investeringskostnad (EIP)', description: 'Physical or intangible assets for innovation project. 50% support. Min 24,000 SEK, 3+ year lifespan.', specification: '50% stod, min 24,000 SEK', grant_value: null, grant_unit: 'SEK', category: 'investment', jurisdiction: 'SE' },
  { id: 'eip-03', grant_id: 'eip-agri-innovationsprojekt', item_code: 'EI-003', name: 'Ovriga utgifter (resor, material)', description: 'Travel, materials, equipment, services for innovation project. 100% support.', specification: '100% stod', grant_value: null, grant_unit: 'SEK', category: 'other', jurisdiction: 'SE' },

  // ── Foradling: additional items ──
  { id: 'for-04', grant_id: 'investeringsstod-foradling', item_code: 'FD-004', name: 'Kyl- och frysanlaggning', description: 'Refrigeration and freezing facilities for processed food products. Walk-in coolers, blast freezers.', specification: 'Livsmedelssakerhet per EG 852/2004', grant_value: 600000, grant_unit: 'SEK', category: 'equipment', jurisdiction: 'SE' },
  { id: 'for-05', grant_id: 'investeringsstod-foradling', item_code: 'FD-005', name: 'Forpackningslinje', description: 'Packaging line for processed food: labeling, sealing, date marking, weighing equipment.', specification: 'Manuell eller halvautomatisk', grant_value: 400000, grant_unit: 'SEK', category: 'equipment', jurisdiction: 'SE' },

  // ── Vatmark items ─���
  { id: 'milj-01', grant_id: 'miljoinvestering-vatmark', item_code: 'MV-001', name: 'Vatmarksanlaggning naringsretention', description: 'Wetland for nutrient retention: excavation, embankments, inlet/outlet structures. Up to 100% support.', specification: 'Min 0.5 ha, max 10 ha vattenyta', grant_value: 600000, grant_unit: 'SEK/ha', category: 'construction', jurisdiction: 'SE' },
  { id: 'milj-02', grant_id: 'miljoinvestering-vatmark', item_code: 'MV-002', name: 'Vatmarksanlaggning biologisk mangfald', description: 'Wetland for biodiversity: shallower, varied shore profile, island features. Up to 50% support.', specification: 'Varierad strandprofil, grunt', grant_value: 300000, grant_unit: 'SEK/ha', category: 'construction', jurisdiction: 'SE' },
  { id: 'milj-03', grant_id: 'miljoinvestering-vatmark', item_code: 'MV-003', name: 'Projektering vatmark', description: 'Design and engineering for wetland: hydrological survey, drawings, environmental impact assessment.', specification: 'Kravs for ansokan', grant_value: null, grant_unit: 'SEK', category: 'services', jurisdiction: 'SE' },
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
  // ── Investment grants: mutually exclusive for SAME cost item ──
  { grant_a: 'investeringsstod-okad-konkurrenskraft', grant_b: 'investeringsstod-robust-primarproduktion', compatible: 0, conditions: 'Mutually exclusive for the same eligible cost item. A single cost cannot receive support from two investment grants. Separate items on the same farm are allowed.', jurisdiction: 'SE' },
  { grant_a: 'investeringsstod-okad-konkurrenskraft', grant_b: 'investeringsstod-kvaveklivet', compatible: 0, conditions: 'Mutually exclusive for same cost. However, ammonia reduction measures under okad konkurrenskraft (80%) overlap with Kvaveklivet — choose the more favourable scheme per item.', jurisdiction: 'SE' },
  { grant_a: 'investeringsstod-okad-konkurrenskraft', grant_b: 'investeringsstod-diversifiering', compatible: 0, conditions: 'Mutually exclusive for the same cost. Diversifiering covers non-agricultural activities; okad konkurrenskraft covers agricultural investments.', jurisdiction: 'SE' },
  { grant_a: 'investeringsstod-okad-konkurrenskraft', grant_b: 'investeringsstod-foradling', compatible: 0, conditions: 'Mutually exclusive for same cost. Foradling covers food processing; okad konkurrenskraft covers primary production.', jurisdiction: 'SE' },
  { grant_a: 'investeringsstod-robust-primarproduktion', grant_b: 'investeringsstod-kvaveklivet', compatible: 0, conditions: 'Mutually exclusive for same cost item. Robust covers resilience; Kvaveklivet covers ammonia/nitrogen.', jurisdiction: 'SE' },
  { grant_a: 'investeringsstod-robust-primarproduktion', grant_b: 'investeringsstod-diversifiering', compatible: 0, conditions: 'Mutually exclusive for same cost. Different purposes: resilience vs diversification.', jurisdiction: 'SE' },
  { grant_a: 'investeringsstod-robust-primarproduktion', grant_b: 'investeringsstod-foradling', compatible: 0, conditions: 'Mutually exclusive for same cost. Robust covers primary production resilience; foradling covers food processing.', jurisdiction: 'SE' },
  { grant_a: 'investeringsstod-kvaveklivet', grant_b: 'investeringsstod-diversifiering', compatible: 0, conditions: 'Mutually exclusive for same cost. Different target: nitrogen vs diversification.', jurisdiction: 'SE' },
  { grant_a: 'investeringsstod-kvaveklivet', grant_b: 'investeringsstod-foradling', compatible: 0, conditions: 'Mutually exclusive for same cost. Different target: nitrogen reduction vs food processing.', jurisdiction: 'SE' },
  { grant_a: 'investeringsstod-diversifiering', grant_b: 'investeringsstod-foradling', compatible: 0, conditions: 'Mutually exclusive for same cost. Foradling covers food processing from agricultural products; diversifiering covers non-agricultural activities.', jurisdiction: 'SE' },

  // ── Startstod + investment grants = compatible ──
  { grant_a: 'startstod', grant_b: 'investeringsstod-okad-konkurrenskraft', compatible: 1, conditions: 'Young farmers can combine start-up grant with investment support. Common combination. Business plan should reference both. Young farmer bonus: 40% support level.', jurisdiction: 'SE' },
  { grant_a: 'startstod', grant_b: 'investeringsstod-robust-primarproduktion', compatible: 1, conditions: 'Young farmers (under 40) may apply for robust primarproduktion without the 2-year operation requirement. Combine freely.', jurisdiction: 'SE' },
  { grant_a: 'startstod', grant_b: 'investeringsstod-kvaveklivet', compatible: 1, conditions: 'Young farmers can combine start-up grant with Kvaveklivet investment.', jurisdiction: 'SE' },
  { grant_a: 'startstod', grant_b: 'investeringsstod-diversifiering', compatible: 1, conditions: 'Young farmers can combine start-up with diversification investment.', jurisdiction: 'SE' },
  { grant_a: 'startstod', grant_b: 'investeringsstod-foradling', compatible: 1, conditions: 'Young farmers can combine start-up with food processing investment.', jurisdiction: 'SE' },
  { grant_a: 'stod-unga-jordbrukare', grant_b: 'startstod', compatible: 1, conditions: 'Both young farmer supports can be received concurrently — startstod is lump sum, stod till unga is per-hectare annual.', jurisdiction: 'SE' },
  { grant_a: 'stod-unga-jordbrukare', grant_b: 'investeringsstod-okad-konkurrenskraft', compatible: 1, conditions: 'Per-hectare young farmer support stacks with investment grants.', jurisdiction: 'SE' },

  // ── Investment + environmental payments = compatible ──
  { grant_a: 'investeringsstod-okad-konkurrenskraft', grant_b: 'miljoinvestering-vatmark', compatible: 1, conditions: 'Investment grants and environmental investments cover different purposes. Can run concurrently on the same farm.', jurisdiction: 'SE' },
  { grant_a: 'investeringsstod-okad-konkurrenskraft', grant_b: 'investeringsstod-vattenvardsatgarder', compatible: 1, conditions: 'Agricultural investment and water quality measures are complementary. Drain tiling under okad konkurrenskraft and wetlands under vattenvardsatgarder can both apply.', jurisdiction: 'SE' },
  { grant_a: 'investeringsstod-okad-konkurrenskraft', grant_b: 'miljoinvestering-stangsel', compatible: 1, conditions: 'Livestock building investment and predator fencing are complementary measures.', jurisdiction: 'SE' },
  { grant_a: 'investeringsstod-okad-konkurrenskraft', grant_b: 'ersattning-ekologisk-produktion', compatible: 1, conditions: 'Investment grant for buildings and annual organic production payment are independent schemes.', jurisdiction: 'SE' },
  { grant_a: 'investeringsstod-okad-konkurrenskraft', grant_b: 'djurvalfardsersattning-mjolkkor', compatible: 1, conditions: 'Building investment and annual animal welfare compensation are independent.', jurisdiction: 'SE' },

  // ── Environmental payments stack freely with each other ──
  { grant_a: 'ersattning-ekologisk-produktion', grant_b: 'djurvalfardsersattning-mjolkkor', compatible: 1, conditions: 'Organic production and dairy welfare payments are independent SAM-based annual payments. Both can be received.', jurisdiction: 'SE' },
  { grant_a: 'ersattning-ekologisk-produktion', grant_b: 'miljoersattning-betesmarker', compatible: 1, conditions: 'Organic compensation and pasture management compensation can apply to different fields on the same farm.', jurisdiction: 'SE' },
  { grant_a: 'ersattning-ekologisk-produktion', grant_b: 'miljoersattning-vallodling', compatible: 1, conditions: 'Organic compensation and grassland compensation can stack if different requirements are met.', jurisdiction: 'SE' },
  { grant_a: 'ersattning-ekologisk-produktion', grant_b: 'notkreatursstod', compatible: 1, conditions: 'Organic payment and cattle income support are independent.', jurisdiction: 'SE' },
  { grant_a: 'djurvalfardsersattning-mjolkkor', grant_b: 'djurvalfardsersattning-far', compatible: 1, conditions: 'Different species — payments stack independently.', jurisdiction: 'SE' },
  { grant_a: 'djurvalfardsersattning-mjolkkor', grant_b: 'notkreatursstod', compatible: 1, conditions: 'Welfare compensation and income support are separate CAP instruments. Both can be received for dairy cows.', jurisdiction: 'SE' },
  { grant_a: 'miljoersattning-betesmarker', grant_b: 'miljoersattning-vallodling', compatible: 0, conditions: 'Pasture management and grassland compensation cannot apply to the same field. Choose one per field.', jurisdiction: 'SE' },

  // ── Kompetensutveckling stacks with everything ──
  { grant_a: 'kompetensutveckling', grant_b: 'investeringsstod-okad-konkurrenskraft', compatible: 1, conditions: 'Training support stacks freely with investment grants. Training recommended as preparation for investment.', jurisdiction: 'SE' },
  { grant_a: 'kompetensutveckling', grant_b: 'investeringsstod-kvaveklivet', compatible: 1, conditions: 'Training on nitrogen management recommended alongside Kvaveklivet investment.', jurisdiction: 'SE' },
  { grant_a: 'kompetensutveckling', grant_b: 'startstod', compatible: 1, conditions: 'Young farmer training encouraged alongside start-up grant.', jurisdiction: 'SE' },
  { grant_a: 'kompetensutveckling', grant_b: 'eip-agri-innovationsprojekt', compatible: 1, conditions: 'Training and innovation are complementary. Different funding instruments.', jurisdiction: 'SE' },

  // ── Innovation vs cooperation ──
  { grant_a: 'eip-agri-innovationsprojekt', grant_b: 'samarbetsstod', compatible: 0, conditions: 'EIP-Agri innovation projects and cooperation grants cannot fund the same activity. Choose one framework per project.', jurisdiction: 'SE' },
  { grant_a: 'eip-agri-innovationsprojekt', grant_b: 'investeringsstod-okad-konkurrenskraft', compatible: 1, conditions: 'Innovation project can lead to investment. Investment grant for resulting equipment is a separate application.', jurisdiction: 'SE' },
  { grant_a: 'eip-agri-innovationsgrupp', grant_b: 'eip-agri-innovationsprojekt', compatible: 1, conditions: 'Group formation support is a prerequisite for the full innovation project. Sequential, not concurrent.', jurisdiction: 'SE' },

  // ── Leader stacking ──
  { grant_a: 'leader-projektstod', grant_b: 'projektstod-landsbygdsutveckling', compatible: 0, conditions: 'Leader project and regular rural development project support cannot fund the same activity. Choose one funding channel.', jurisdiction: 'SE' },
  { grant_a: 'leader-projektstod', grant_b: 'samarbetsstod', compatible: 0, conditions: 'Cannot double-fund the same cooperation activity through Leader and samarbetsstod.', jurisdiction: 'SE' },
  { grant_a: 'leader-projektstod', grant_b: 'investeringsstod-okad-konkurrenskraft', compatible: 1, conditions: 'Leader project and agricultural investment are independent if covering different costs.', jurisdiction: 'SE' },

  // ── Broadband ──
  { grant_a: 'bredbandsstod', grant_b: 'leader-projektstod', compatible: 0, conditions: 'PTS broadband support and Leader broadband projects cannot fund the same infrastructure. Coordination with PTS required to prevent double financing.', jurisdiction: 'SE' },
  { grant_a: 'bredbandsstod', grant_b: 'projektstod-landsbygdsutveckling', compatible: 0, conditions: 'PTS broadband and rural development project cannot fund the same broadband build.', jurisdiction: 'SE' },

  // ── Water/environmental investment cross-stacking ──
  { grant_a: 'investeringsstod-vattenvardsatgarder', grant_b: 'miljoinvestering-tvastegsdiken', compatible: 0, conditions: 'Two-stage ditches can be funded under either scheme but not both. Use the dedicated tvastegsdiken programme for ditch-only projects.', jurisdiction: 'SE' },
  { grant_a: 'investeringsstod-vattenvardsatgarder', grant_b: 'miljoinvestering-vatmark', compatible: 0, conditions: 'Wetland construction can be funded under either scheme but not both for the same wetland.', jurisdiction: 'SE' },
  { grant_a: 'miljoinvestering-tvastegsdiken', grant_b: 'miljoinvestering-vatmark', compatible: 1, conditions: 'Two-stage ditch and wetland on the same farm are complementary water quality measures. Different locations required.', jurisdiction: 'SE' },

  // ── Regional + national ──
  { grant_a: 'regionalt-investeringsstod', grant_b: 'investeringsstod-okad-konkurrenskraft', compatible: 0, conditions: 'Regional calls are part of the same national scheme (okad konkurrenskraft). Applied through Lansstyrelsen, counts toward the same 3-year maximum.', jurisdiction: 'SE' },

  // ── Foradling + diversifiering cross ──
  { grant_a: 'investeringsstod-foradling', grant_b: 'projektstod-landsbygdsutveckling', compatible: 1, conditions: 'Processing investment and rural development project support can complement each other if covering different costs. E.g., foradling for equipment, projektstod for marketing.', jurisdiction: 'SE' },
  { grant_a: 'investeringsstod-diversifiering', grant_b: 'projektstod-landsbygdsutveckling', compatible: 1, conditions: 'Diversification investment and rural development project can complement each other for different cost items.', jurisdiction: 'SE' },
];

console.log(`Inserting ${stackingRules.length} stacking rules...`);

const insertStacking = db.instance.prepare(
  `INSERT OR REPLACE INTO stacking_rules (grant_a, grant_b, compatible, conditions, jurisdiction)
   VALUES (?, ?, ?, ?, ?)`
);

for (const rule of stackingRules) {
  insertStacking.run(rule.grant_a, rule.grant_b, rule.compatible, rule.conditions, rule.jurisdiction);
}

// ─── APPLICATION GUIDANCE ───────────���─────────────────────────────────────────

interface AppGuidance {
  grant_id: string;
  step_order: number;
  description: string;
  evidence_required: string | null;
  portal: string | null;
  jurisdiction: string;
}

const applicationGuidance: AppGuidance[] = [
  // ── Okad konkurrenskraft (primary investment grant, detailed) ──
  { grant_id: 'investeringsstod-okad-konkurrenskraft', step_order: 1, description: 'Registrera dig som kund hos Jordbruksverket. Skaffa e-legitimation (BankID) for inloggning i e-tjansten.', evidence_required: 'BankID, organisationsnummer', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/projektstod-investeringsstod-och-foretagsstod', jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-okad-konkurrenskraft', step_order: 2, description: 'Gor en SAM-ansokan (Samlad ansokningsansokan) for att registrera ditt jordbruksforetag och dina skiften.', evidence_required: 'Fastighetsuppgifter, arrendekontrakt, djurantal', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/sam-internet', jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-okad-konkurrenskraft', step_order: 3, description: 'Kontrollera att din investering ar stodberattigad. Minsta investering 200,000 SEK (100,000 SEK for tackdikning, energiskog, rennaring). Kontrollera att kostnaden inte ar lagkrav, ersattningsinvestering, leasing, eller gar till bostader.', evidence_required: 'Investeringsbeskrivning, preliminar budget', portal: null, jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-okad-konkurrenskraft', step_order: 4, description: 'Ta in minst 2 offerter per kostnadskategori for byggnation och utrustning. Dokumentera upphandlingsprocessen.', evidence_required: 'Min 2 offerter per kostnadskategori, upphandlingsprotokoll', portal: null, jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-okad-konkurrenskraft', step_order: 5, description: 'Skicka in ansokan i e-tjansten "Projektstod, investeringsstod och foretagsstod". Bifoga alla bilagor. VIKTIGT: Du far inte paborja investeringen innan du har skickat in din ansokan.', evidence_required: 'Komplett ansokan, offerter, ritningar, eventuellt bygglov, urvalsmall med ekonomiska nyckeltal', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/projektstod-investeringsstod-och-foretagsstod', jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-okad-konkurrenskraft', step_order: 6, description: 'Vanta pa beslut om stod (handlaggningstid ungefar 5 manader). Under denna tid far du inte paborja investeringen.', evidence_required: null, portal: null, jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-okad-konkurrenskraft', step_order: 7, description: 'Genomfor investeringen efter beviljat beslut. Samla alla fakturor och betalningsbevis. Investering maste anvanda fornybar energi.', evidence_required: 'Fakturor, betalningsbevis (kontoutdrag), fotodokumentation via Geofoto-appen', portal: null, jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-okad-konkurrenskraft', step_order: 8, description: 'Ansok om utbetalning: forskottsbetalning, delbetalning eller slutbetalning. Handlaggningstid ungefar 2 manader. Forsenad slutbetalningsansokan: 1% avdrag per arbetsdag forsenad, 0 SEK efter 25 dagar.', evidence_required: 'Slutredovisning, alla fakturor, fotodokumentation, EU-skylt pa investeringsstallet', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/projektstod-investeringsstod-och-foretagsstod', jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-okad-konkurrenskraft', step_order: 9, description: 'Behall investeringen i minst 5 ar efter slutbetalning. EU-logga ska vara synlig pa investeringsstallet under denna period.', evidence_required: 'EU-logga, arlig SAM-ansokan', portal: null, jurisdiction: 'SE' },

  // ── Robust primarproduktion ──
  { grant_id: 'investeringsstod-robust-primarproduktion', step_order: 1, description: 'Verifiera att ditt foretag har bedrivit verksamhet i Sverige i minst 2 ar. Undantag: unga jordbrukare under 40 ar.', evidence_required: 'Organisationsnummer, senaste 2 ars deklarationer', portal: null, jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-robust-primarproduktion', step_order: 2, description: 'Identifiera sarbarhet: stromavbrott, vattenforsorjning, transportavbrott, IT-incidenter, insatsvarobrist, stold/sabotage. Beskriv hur investeringen minskar sarbarheten.', evidence_required: 'Sarbarhetsanalys, beskrivning av risk och atgard', portal: null, jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-robust-primarproduktion', step_order: 3, description: 'Skicka in ansokan i e-tjansten. Min 50,000 SEK stodberattigande kostnader. VIKTIGT: Du far inte paborja investeringen fore ansokan.', evidence_required: 'Komplett ansokan, offerter, sarbarhetsanalys', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/projektstod-investeringsstod-och-foretagsstod', jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-robust-primarproduktion', step_order: 4, description: 'Ansok om forskott (50% av beviljat stod) vid behov. Genomfor investeringen. Spara alla fakturor.', evidence_required: 'Fakturor, betalningsbevis, installationsprotokoll', portal: null, jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-robust-primarproduktion', step_order: 5, description: 'Ansok om slutbetalning med redovisning. Max 5,000,000 SEK per mottagare.', evidence_required: 'Slutredovisning, fakturor, fotodokumentation', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/projektstod-investeringsstod-och-foretagsstod', jurisdiction: 'SE' },

  // ── Kvaveklivet ──
  { grant_id: 'investeringsstod-kvaveklivet', step_order: 1, description: 'Bestam vilken del av stodet som ar relevant: (1) ammoniakminskning (80%/50%) eller (2) effektivt kvaveutnyttjande (30%).', evidence_required: 'Beskrivning av planerad investering', portal: null, jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-kvaveklivet', step_order: 2, description: 'Skicka in ansokan i e-tjansten. Valj "Kvaveklivet" som stodtyp. VIKTIGT: Paborja inte investeringen fore ansokan.', evidence_required: 'Komplett ansokan, offerter, teknisk specifikation', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/projektstod-investeringsstod-och-foretagsstod', jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-kvaveklivet', step_order: 3, description: 'Genomfor investeringen efter beviljat beslut. Dokumentera med geotaggade foton via Geofoto-appen.', evidence_required: 'Fakturor, geotaggade foton, installationsprotokoll', portal: null, jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-kvaveklivet', step_order: 4, description: 'Ansok om slutbetalning (oppnar host 2025). Behall investeringen 5 ar.', evidence_required: 'Slutredovisning, fakturor, fotodokumentation', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/projektstod-investeringsstod-och-foretagsstod', jurisdiction: 'SE' },

  // ── Diversifiering ��─
  { grant_id: 'investeringsstod-diversifiering', step_order: 1, description: 'Kontrollera att du driver ett jordbruks-, tradgards- eller rennaringsforetag. Hastavel racknas inte. Kontakta din Lansstyrelse for regionala begransningar.', evidence_required: 'Organisationsnummer, SAM-registrering', portal: null, jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-diversifiering', step_order: 2, description: 'Planera investeringen. Min 100,000 SEK stodberattigande kostnader. Max 40% stod, max 800,000 SEK per 3-arsperiod. Ingen fossil upphirvning.', evidence_required: 'Investeringsplan, offerter', portal: null, jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-diversifiering', step_order: 3, description: 'Skicka in ansokan i e-tjansten under ansokningsperioden (t.ex. 1 feb — 30 apr 2025). Vanta pa beslut (ca 6 manader).', evidence_required: 'Komplett ansokan, offerter, tillstand', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/projektstod-investeringsstod-och-foretagsstod', jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-diversifiering', step_order: 4, description: 'Genomfor investering och ansok om utbetalning (ca 1 manads handlaggningstid).', evidence_required: 'Fakturor, betalningsbevis, fotodokumentation', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/projektstod-investeringsstod-och-foretagsstod', jurisdiction: 'SE' },

  // ── Foradling ──
  { grant_id: 'investeringsstod-foradling', step_order: 1, description: 'Kontrollera att produkten finns pa Jordbruksverkets lista over godkanda jordbruksprodukter for foradlingsstod. Fisk/vattenbruksprodukter uteslutna.', evidence_required: 'Produktbeskrivning, lista over godkanda produkter', portal: 'https://jordbruksverket.se/stod/livsmedel/foradling-av-jordbruksprodukter/godkanda-jordbruksprodukter-for-foradlingsstod', jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-foradling', step_order: 2, description: 'Ta in offerter. Min 100,000 SEK, max 3,000,000 SEK stodberattigande kostnader. Budgetmall fran Jordbruksverket.', evidence_required: 'Offerter, budgetmall, leverantorsspecifikationer', portal: null, jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-foradling', step_order: 3, description: 'Skicka in ansokan i e-tjansten. Sackerhetsstall livsmedelsverkets tillstand. Handlaggningstid ca 6 manader.', evidence_required: 'Komplett ansokan, offerter, tillstand, budgetmall', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/projektstod-investeringsstod-och-foretagsstod', jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-foradling', step_order: 4, description: 'Ansok om forskott (max 50%, max 250,000 SEK) om du onskar. Genomfor investeringen.', evidence_required: 'Kvitton, bankutdrag', portal: null, jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-foradling', step_order: 5, description: 'Ansok om slutbetalning (ca 2 manader handlaggningstid). For begagnad utrustning: intyg att den inte tidigare fatt EU-stod.', evidence_required: 'Slutredovisning, fakturor, begagnadinttyg vid behov', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/projektstod-investeringsstod-och-foretagsstod', jurisdiction: 'SE' },

  // ── Vattenvardsatgarder ──
  { grant_id: 'investeringsstod-vattenvardsatgarder', step_order: 1, description: 'Kontakta Lansstyrelsen for forhandsbedommning av planerad vattenvardsatgard. Verifiera att marken ar jordbruksmark.', evidence_required: 'Kartunderlag, fastighetsuppgifter, markagartillstand', portal: 'https://www.lansstyrelsen.se', jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-vattenvardsatgarder', step_order: 2, description: 'Anlita vatmarksradgivare for projektering (vatmarker) eller ta in offerter (kalkfilterdiken, tvastegsdiken). Min 30,000 SEK.', evidence_required: 'Projekteringsrapport eller offerter, hydrologisk utredning', portal: null, jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-vattenvardsatgarder', step_order: 3, description: 'Sok vatverksamhetstillstand hos Lansstyrelsen (miljobalken 11 kap) for vatmarksanlaggning.', evidence_required: 'Anmalan/tillstandsansokan, miljokonsekvensbedomning', portal: 'https://www.lansstyrelsen.se', jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-vattenvardsatgarder', step_order: 4, description: 'Skicka in ansokan i e-tjansten. Handlaggningstid ca 10 manader.', evidence_required: 'Komplett ansokan, projektering, tillstand, offerter', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/projektstod-investeringsstod-och-foretagsstod', jurisdiction: 'SE' },
  { grant_id: 'investeringsstod-vattenvardsatgarder', step_order: 5, description: 'Genomfor anlaggningen och ansok om slutbetalning. Sackerhetsstall arlig miljoersattning for vatmarksskotsel efter slutbetalning.', evidence_required: 'Slutredovisning, fakturor, fotodokumentation, funktionstest', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/projektstod-investeringsstod-och-foretagsstod', jurisdiction: 'SE' },

  // ── Tvastegsdiken ──
  { grant_id: 'miljoinvestering-tvastegsdiken', step_order: 1, description: 'Kontakta Lansstyrelsen for forhandsbedommning. Kontrollera att det handlar om jordbruksmark.', evidence_required: 'Kartunderlag, fastighetsinformation', portal: 'https://www.lansstyrelsen.se', jurisdiction: 'SE' },
  { grant_id: 'miljoinvestering-tvastegsdiken', step_order: 2, description: 'Planera dikestrackningen. Max 1,000 SEK/m, min 30,000 SEK totalutgift.', evidence_required: 'Karta med dikestrackning, offerter pa graving', portal: null, jurisdiction: 'SE' },
  { grant_id: 'miljoinvestering-tvastegsdiken', step_order: 3, description: 'Ansokan i e-tjansten. Handlaggningstid ca 10 manader.', evidence_required: 'Komplett ansokan, offerter, karta', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/projektstod-investeringsstod-och-foretagsstod', jurisdiction: 'SE' },
  { grant_id: 'miljoinvestering-tvastegsdiken', step_order: 4, description: 'Genomfor arbetet och ansok om slutbetalning.', evidence_required: 'Fakturor, fotodokumentation', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/projektstod-investeringsstod-och-foretagsstod', jurisdiction: 'SE' },

  // ── Vatmark ──
  { grant_id: 'miljoinvestering-vatmark', step_order: 1, description: 'Kontakta Lansstyrelsen for en forhandsbedommning av lamplig plats for vatmark.', evidence_required: 'Kartunderlag, fastighetsinformation', portal: 'https://www.lansstyrelsen.se', jurisdiction: 'SE' },
  { grant_id: 'miljoinvestering-vatmark', step_order: 2, description: 'Anlita vatmarksradgivare for projektering. Inkluderar hydrologi, ritningar, och miljokonsekvensbedomning.', evidence_required: 'Projekteringsrapport, ritningar, hydrologisk utredning', portal: null, jurisdiction: 'SE' },
  { grant_id: 'miljoinvestering-vatmark', step_order: 3, description: 'Sok tillstand for vatverksamhet hos Lansstyrelsen (miljobalken 11 kap).', evidence_required: 'Anmalan/tillstandsansokan, miljokonsekvensbedomning', portal: 'https://www.lansstyrelsen.se', jurisdiction: 'SE' },
  { grant_id: 'miljoinvestering-vatmark', step_order: 4, description: 'Ansokan till Jordbruksverket via e-tjanst med projekteringsunderlag och tillstand.', evidence_required: 'Komplett ansokan, projektering, tillstand, offerter', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/projektstod-investeringsstod-och-foretagsstod', jurisdiction: 'SE' },
  { grant_id: 'miljoinvestering-vatmark', step_order: 5, description: 'Genomfor anlaggningen och ansok om slutbetalning.', evidence_required: 'Slutredovisning, fakturor, fotodokumentation, funktionstest', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/projektstod-investeringsstod-och-foretagsstod', jurisdiction: 'SE' },

  // ── Stangsel mot rovdjur ���─
  { grant_id: 'miljoinvestering-stangsel', step_order: 1, description: 'Kontakta din Lansstyrelse for att verifiera att omradet klassas som rovdjursomrade.', evidence_required: 'Rovdjursinventering eller besiktningstjanst', portal: 'https://www.lansstyrelsen.se', jurisdiction: 'SE' },
  { grant_id: 'miljoinvestering-stangsel', step_order: 2, description: 'Planera stangselstrackning med Lansstyrelsens rovdjurshandlaggare.', evidence_required: 'Kartskiss, betesareal, antal djur', portal: null, jurisdiction: 'SE' },
  { grant_id: 'miljoinvestering-stangsel', step_order: 3, description: 'Ansokan om stangselstod till Lansstyrelsen.', evidence_required: 'Ansokan, kartskiss, offerter, registrerat djurhall', portal: 'https://www.lansstyrelsen.se', jurisdiction: 'SE' },
  { grant_id: 'miljoinvestering-stangsel', step_order: 4, description: 'Inkop material och uppfor stangsel enligt specifikation.', evidence_required: 'Fakturor, fotodokumentation', portal: null, jurisdiction: 'SE' },
  { grant_id: 'miljoinvestering-stangsel', step_order: 5, description: 'Besiktning av Lansstyrelsen och slutbetalning.', evidence_required: 'Slutredovisning, besiktningsprotokoll', portal: 'https://www.lansstyrelsen.se', jurisdiction: 'SE' },

  // ── Startstod ──
  { grant_id: 'startstod', step_order: 1, description: 'Kontrollera att du uppfyller villkoren: 40 ar eller yngre, forsta gardsforetaget, gymnasieexamen ELLER min 12 manaders heltidserfarenhet.', evidence_required: 'Utbildningsbevis eller anstallningsintyg', portal: null, jurisdiction: 'SE' },
  { grant_id: 'startstod', step_order: 2, description: 'Registrera jordbruksforetag (enskild firma — juridisk person kan inte soka). Gor SAM-ansokan.', evidence_required: 'Organisationsnummer, fastighetsbeteckning, SAM-registrering', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/sam-internet', jurisdiction: 'SE' },
  { grant_id: 'startstod', step_order: 3, description: 'Skriv affarsplan (3-5 ar). Visa hur gardsforetaget ska bli lonsamt. Jordbruksinkomst maste na minst 1/3 av total foretagsinkomst vid slutbetalning.', evidence_required: 'Affarsplan, budget, produktionsplan', portal: null, jurisdiction: 'SE' },
  { grant_id: 'startstod', step_order: 4, description: 'Skicka in ansokan inom 24 manader fran det att du uppfyllde stodvillkoren. Handlaggningstid ca 6 manader.', evidence_required: 'Komplett ansokan, affarsplan, aldersbevis, utbildningsbevis, urvalsmall med nyckeltal', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/projektstod-investeringsstod-och-foretagsstod', jurisdiction: 'SE' },
  { grant_id: 'startstod', step_order: 5, description: 'Paborja genomforande av affarsplanen inom 9 manader fran beslut. 2/3 av stodet betalas ut direkt.', evidence_required: 'Bekraftelse pa genomforande', portal: null, jurisdiction: 'SE' },
  { grant_id: 'startstod', step_order: 6, description: 'Ansok om slutbetalning (1/3 av stodet) senast 45 manader efter beslut. Visa att jordbruksinkomsten natt 1/3 av foretagsinkomsten.', evidence_required: 'Deklaration, arsredovisning, SAM-ansokan', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/projektstod-investeringsstod-och-foretagsstod', jurisdiction: 'SE' },

  // ── Stod till unga jordbrukare (SAM) ──
  { grant_id: 'stod-unga-jordbrukare', step_order: 1, description: 'Kontrollera behorighet: 40 ar eller yngre, forstagangsbrukare, min 4 ha jordbruksmark, aktiv jordbrukare.', evidence_required: 'Aldersbevis, utbildningsbevis, fastighetsuppgifter', portal: null, jurisdiction: 'SE' },
  { grant_id: 'stod-unga-jordbrukare', step_order: 2, description: 'Ansok via SAM Internet senast 9 april (2026). 1% avdrag per arbetsdag forsenad, 0 SEK efter 4 maj.', evidence_required: 'SAM-ansokan, agandedokumentation', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/sam-internet', jurisdiction: 'SE' },
  { grant_id: 'stod-unga-jordbrukare', step_order: 3, description: 'Utbetalning sker automatiskt baserat pa SAM-ansokan. Stodet betalas ut per hektar, belopp varierar (85-159 EUR/ha).', evidence_required: null, portal: null, jurisdiction: 'SE' },

  // ── Ekologisk produktion (SAM) ──
  { grant_id: 'ersattning-ekologisk-produktion', step_order: 1, description: 'Anmal din produktion till godkand certifieringsorgan senast 9 april (aret du soker). Bade vaxtodling och djurhallning maste vara certifierade for djurstod.', evidence_required: 'Certifiering, anmalan till certifieringsorgan', portal: null, jurisdiction: 'SE' },
  { grant_id: 'ersattning-ekologisk-produktion', step_order: 2, description: 'Ansok via SAM Internet senast 9 april. Registrera vilka skiften (min 0.1 ha vardera) som ar ekologiska.', evidence_required: 'SAM-ansokan, certifieringsintyg', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/sam-internet', jurisdiction: 'SE' },
  { grant_id: 'ersattning-ekologisk-produktion', step_order: 3, description: 'Folj EU:s regler for ekologisk produktion fran 1 januari det ar du soker. Behall dokumentation for kontroll under stodiret och aret efter.', evidence_required: 'Odlingsjournal, certifieringsrapport', portal: null, jurisdiction: 'SE' },

  // ── Djurvalfardsersattning mjolkkor (SAM) ──
  { grant_id: 'djurvalfardsersattning-mjolkkor', step_order: 1, description: 'Kontrollera att djuren ar registrerade i CDB (centrala djurdatabasen) med korrekt ID och dokumentation.', evidence_required: 'CDB-registrering, djurantalet', portal: null, jurisdiction: 'SE' },
  { grant_id: 'djurvalfardsersattning-mjolkkor', step_order: 2, description: 'Ansok via SAM Internet senast 9 april (2026). Krav fran 2026: bade klovhalsovard OCH betesgang.', evidence_required: 'SAM-ansokan', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/sam-internet', jurisdiction: 'SE' },
  { grant_id: 'djurvalfardsersattning-mjolkkor', step_order: 3, description: 'Klovhalsovard: inspektera och verka klovar min 2 ggr/ar (min 3 manader mellan), certifierad klovvardare, uppratta klovhalsovan.', evidence_required: 'Klovhalsorapport, protokoll fran varje inspektion', portal: null, jurisdiction: 'SE' },
  { grant_id: 'djurvalfardsersattning-mjolkkor', step_order: 4, description: 'Betesgang: hall kor pa bete under lagstadgat antal dagar. Dokumentera per grupp: stallingsnummer, antal djur, datum pa bete.', evidence_required: 'Betesdokumentation, mjolkrapporter, eller ekologisk certifiering', portal: null, jurisdiction: 'SE' },
  { grant_id: 'djurvalfardsersattning-mjolkkor', step_order: 5, description: 'Utbetalning sker i december. 1,300 SEK per djurenhet. Min utbetalning 1,000 SEK.', evidence_required: null, portal: null, jurisdiction: 'SE' },

  // ── EIP-Agri innovationsgrupp ��─
  { grant_id: 'eip-agri-innovationsgrupp', step_order: 1, description: 'Kontakta innovationsstodet hos Landsbygdsnatverket for att diskutera din ide och fa tips.', evidence_required: null, portal: 'https://jordbruksverket.se/stod/innovationsprojekt-inom-eip', jurisdiction: 'SE' },
  { grant_id: 'eip-agri-innovationsgrupp', step_order: 2, description: 'Bilda innovationsgrupp: min 2 organisationer, min 2 kompetensomraden (primarproducenter, forskare, radgivare).', evidence_required: 'Samarbetsavtal, kontaktuppgifter for alla parter', portal: null, jurisdiction: 'SE' },
  { grant_id: 'eip-agri-innovationsgrupp', step_order: 3, description: 'Ansok i e-tjansten. 80,000 SEK for 2-4 organisationer, 120,000 SEK for 5+.', evidence_required: 'Komplett ansokan, samarbetsavtal', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/projektstod-investeringsstod-och-foretagsstod', jurisdiction: 'SE' },

  // ── EIP-Agri innovationsprojekt ──
  { grant_id: 'eip-agri-innovationsprojekt', step_order: 1, description: 'Sackerhetsstall att ni har en bildad innovationsgrupp med samarbetsavtal som anger roller, ekonomisk fordelning och IP-rattigheter.', evidence_required: 'Samarbetsavtal med alla parter', portal: null, jurisdiction: 'SE' },
  { grant_id: 'eip-agri-innovationsprojekt', step_order: 2, description: 'Utveckla projektplan: problem, metod, forvantade resultat, budget, tidsplan. Utred frihet att agera (FTO) avseende patent/varumarken.', evidence_required: 'Projektplan, budget, CV for nyckelpersoner, FTO-utredning', portal: null, jurisdiction: 'SE' },
  { grant_id: 'eip-agri-innovationsprojekt', step_order: 3, description: 'Skicka in ansokan. Beslut fattas i beslutsomgangar (2026: 31 mars, 30 juni, 30 sept, 11 dec kl 13:00). Handlaggningstid ca 6 manader.', evidence_required: 'Komplett ansokan, projektplan, samtliga bilagor', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/projektstod-investeringsstod-och-foretagsstod', jurisdiction: 'SE' },
  { grant_id: 'eip-agri-innovationsprojekt', step_order: 4, description: 'Genomfor projektet. Halvarsvis rapportering. Forskott max 250,000 SEK (50% av totalt stod).', evidence_required: 'Halvarsrapporter, ekonomisk redovisning', portal: null, jurisdiction: 'SE' },
  { grant_id: 'eip-agri-innovationsprojekt', step_order: 5, description: 'Slutrapport med resultat och spridningsplan. Slutbetalning senast 6 april 2029.', evidence_required: 'Slutrapport, ekonomisk slutredovisning, spridningsplan', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/projektstod-investeringsstod-och-foretagsstod', jurisdiction: 'SE' },

  // ── Kompetensutveckling ──
  { grant_id: 'kompetensutveckling', step_order: 1, description: 'For anordnare: identifiera tematiskt omrade (konkurrenskraft/djurvelfard, miljo/klimat, eller livsmedel/turism).', evidence_required: 'Projektbeskrivning', portal: null, jurisdiction: 'SE' },
  { grant_id: 'kompetensutveckling', step_order: 2, description: 'Bevaka utlysningar och upphandlingar fran Jordbruksverket. Poangbaserat urval, max 1,000 poang.', evidence_required: null, portal: 'https://jordbruksverket.se/stod/utlysningar-och-upphandlingar/kompetensutveckling', jurisdiction: 'SE' },
  { grant_id: 'kompetensutveckling', step_order: 3, description: 'Skicka in ansokan under oppen utlysning eller inbjuden upphandling.', evidence_required: 'Komplett ansokan, projektplan, budget', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/projektstod-investeringsstod-och-foretagsstod', jurisdiction: 'SE' },
  { grant_id: 'kompetensutveckling', step_order: 4, description: 'Genomfor aktiviteten. Samla deltagarlistor och narvarointyg.', evidence_required: 'Deltagarintyg, narvarolista, utvardering', portal: null, jurisdiction: 'SE' },

  // ── Samarbetsstod ──
  { grant_id: 'samarbetsstod', step_order: 1, description: 'Identifiera samarbetspartners: min 2 lantbruksforetag. Tecka samarbetsavtal eller avsiktsforklaring.', evidence_required: 'Samarbetsavtal eller avsiktsforklaring', portal: null, jurisdiction: 'SE' },
  { grant_id: 'samarbetsstod', step_order: 2, description: 'Ta fram projektplan: korta leveranskedjor, lokal marknad, gemensam forardling. Budget med max 70% stodandel.', evidence_required: 'Projektplan, budget, marknadsanalys', portal: null, jurisdiction: 'SE' },
  { grant_id: 'samarbetsstod', step_order: 3, description: 'Skicka in ansokan i e-tjansten.', evidence_required: 'Komplett ansokan, samarbetsavtal, projektplan', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/projektstod-investeringsstod-och-foretagsstod', jurisdiction: 'SE' },
  { grant_id: 'samarbetsstod', step_order: 4, description: 'Genomfor samarbetsprojektet. Halvarsredovisning.', evidence_required: 'Lagesrapporter, fakturor', portal: null, jurisdiction: 'SE' },
  { grant_id: 'samarbetsstod', step_order: 5, description: 'Slutrapport och slutbetalning.', evidence_required: 'Slutrapport, ekonomisk slutredovisning', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/projektstod-investeringsstod-och-foretagsstod', jurisdiction: 'SE' },

  // ── Leader ──
  { grant_id: 'leader-projektstod', step_order: 1, description: 'Kontakta ditt lokala Leaderkontor for att diskutera projektiden och kontrollera att den stammer med omradets utvecklingsstrategi.', evidence_required: null, portal: 'https://jordbruksverket.se/stod/lokalt-ledd-utveckling-genom-leader', jurisdiction: 'SE' },
  { grant_id: 'leader-projektstod', step_order: 2, description: 'Skriv projektplan med mal, aktiviteter, budget och forvantade resultat. Definiera offentlig nytta eller foretagsnytta.', evidence_required: 'Projektplan, budget, tidsplan', portal: null, jurisdiction: 'SE' },
  { grant_id: 'leader-projektstod', step_order: 3, description: 'Skicka in ansokan i Jordbruksverkets e-tjanst. Handlaggningstid ca 11 manader.', evidence_required: 'Komplett ansokan, projektplan, budget, medfinansieringsintyg om relevant', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/projektstod-investeringsstod-och-foretagsstod', jurisdiction: 'SE' },
  { grant_id: 'leader-projektstod', step_order: 4, description: 'Genomfor projektet. Lopande redovisning. Investeringar behalls i minst 5 ar.', evidence_required: 'Lagesrapporter, ekonomisk uppfoljning', portal: null, jurisdiction: 'SE' },
  { grant_id: 'leader-projektstod', step_order: 5, description: 'Slutredovisning. Ansok om utbetalning (ca 5 manaders handlaggningstid).', evidence_required: 'Slutrapport, ekonomisk slutredovisning', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/projektstod-investeringsstod-och-foretagsstod', jurisdiction: 'SE' },

  // ── Bredband ──
  { grant_id: 'bredbandsstod', step_order: 1, description: 'Bilda bredbandsforening eller identifiera projektansokan via kommun. Kontrollera att omradet saknar kommersiell bredbandsutbyggnad.', evidence_required: 'Stadgar, medlemsforteckning eller kommunbeslut, marknadsanalys', portal: null, jurisdiction: 'SE' },
  { grant_id: 'bredbandsstod', step_order: 2, description: 'Ta fram projekteringsunderlag: trasadragning, husanslutningar, kostnadsberakning.', evidence_required: 'Projekteringsrapport, karta, kostnadsberakning', portal: null, jurisdiction: 'SE' },
  { grant_id: 'bredbandsstod', step_order: 3, description: 'Sok tillstand for ledningsdragning och markavtal med berorda markagare.', evidence_required: 'Markavtal, ledningsratt, tillstandsdokument', portal: null, jurisdiction: 'SE' },
  { grant_id: 'bredbandsstod', step_order: 4, description: 'Skicka in ansokan till PTS. Budget fordelas mellan tre stodmedelsomraden: Norrland, Svealand, Gotaland.', evidence_required: 'Komplett ansokan, projektering, markavtal, budget', portal: 'https://pts.se/internet-och-telefoni/bredband/bredbandsstod/', jurisdiction: 'SE' },
  { grant_id: 'bredbandsstod', step_order: 5, description: 'Genomfor byggnation, driftsatt, slutbetalning.', evidence_required: 'Besiktningsprotokoll, fakturor, anslutningsstatistik', portal: 'https://pts.se/internet-och-telefoni/bredband/bredbandsstod/', jurisdiction: 'SE' },

  // ── Projektstod landsbygdsutveckling ──
  { grant_id: 'projektstod-landsbygdsutveckling', step_order: 1, description: 'Kontakta Lansstyrelsen eller Tillvaxtverket for att diskutera projektiden.', evidence_required: null, portal: 'https://www.lansstyrelsen.se', jurisdiction: 'SE' },
  { grant_id: 'projektstod-landsbygdsutveckling', step_order: 2, description: 'Skriv projektplan med mal, aktiviteter, budget och forvantade resultat.', evidence_required: 'Projektplan, budget, tidsplan', portal: null, jurisdiction: 'SE' },
  { grant_id: 'projektstod-landsbygdsutveckling', step_order: 3, description: 'Skicka in ansokan till Jordbruksverkets e-tjanst.', evidence_required: 'Komplett ansokan, projektplan, CV, medfinansieringsintyg', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/projektstod-investeringsstod-och-foretagsstod', jurisdiction: 'SE' },
  { grant_id: 'projektstod-landsbygdsutveckling', step_order: 4, description: 'Genomfor projektet enligt plan. Lopande redovisning.', evidence_required: 'Lagesrapporter, ekonomisk uppfoljning', portal: null, jurisdiction: 'SE' },
  { grant_id: 'projektstod-landsbygdsutveckling', step_order: 5, description: 'Slutredovisning och slutbetalning.', evidence_required: 'Slutrapport, ekonomisk slutredovisning, resultatbevis', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/projektstod-investeringsstod-och-foretagsstod', jurisdiction: 'SE' },

  // ── Regionalt investeringsstod ──
  { grant_id: 'regionalt-investeringsstod', step_order: 1, description: 'Kontakta din Lansstyrelse for att ta reda pa aktuella utlysningar och deadlines i ditt lan.', evidence_required: null, portal: 'https://www.lansstyrelsen.se', jurisdiction: 'SE' },
  { grant_id: 'regionalt-investeringsstod', step_order: 2, description: 'Ansok via e-tjansten under den regionala utlysningsperioden. Poangbaserat urval.', evidence_required: 'Komplett ansokan, offerter, urvalsmall', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/projektstod-investeringsstod-och-foretagsstod', jurisdiction: 'SE' },
  { grant_id: 'regionalt-investeringsstod', step_order: 3, description: 'Genomfor investering efter beviljat beslut. Ansok om utbetalning.', evidence_required: 'Fakturor, betalningsbevis, fotodokumentation', portal: 'https://jordbruksverket.se/e-tjanster-databaser-och-appar/e-tjanster-och-databaser-stod/projektstod-investeringsstod-och-foretagsstod', jurisdiction: 'SE' },
];

console.log(`Inserting ${applicationGuidance.length} application guidance steps...`);

const insertGuidance = db.instance.prepare(
  `INSERT OR REPLACE INTO application_guidance (grant_id, step_order, description, evidence_required, portal, jurisdiction)
   VALUES (?, ?, ?, ?, ?, ?)`
);

for (const g of applicationGuidance) {
  insertGuidance.run(g.grant_id, g.step_order, g.description, g.evidence_required, g.portal, g.jurisdiction);
}

// ─── FTS5 SEARCH INDEX ──────────────────��─────────────────────────────────────

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

// ─── COVERAGE FILE ────────────────────────────────────────��───────────────────

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
  sources: [
    'jordbruksverket.se — Strategiska planen 2023-2027',
    'jordbruksverket.se — Investeringsstod for jordbruk, tradgard och rennaring',
    'jordbruksverket.se — Kvaveklivet',
    'jordbruksverket.se — Robust primarproduktion',
    'jordbruksverket.se — Foradling av jordbruksprodukter 2024-2027',
    'jordbruksverket.se — Startstod / Stod till unga jordbrukare',
    'jordbruksverket.se — Ersattning for ekologisk produktion',
    'jordbruksverket.se — Djurvalfardsersattning mjolkkor / far',
    'jordbruksverket.se — Miljoersattning vallodling / betesmarker',
    'jordbruksverket.se — Vattenvardsatgarder / tvastegsdiken / vatmarker',
    'jordbruksverket.se — EIP-Agri innovationsprojekt',
    'jordbruksverket.se — Leader 2023-2027',
    'jordbruksverket.se — Kompetensutveckling',
    'pts.se — Bredbandsstod 2024-2027',
    'tillvaxtverket.se — Landsbygdsprogram / service i landsbygder',
    'lansstyrelsen.se — Regionala investeringsstod',
  ],
}, null, 2));

db.close();

console.log(`\nIngestion complete:`);
console.log(`  Grants:              ${grants.length}`);
console.log(`  Grant items:         ${grantItems.length}`);
console.log(`  Stacking rules:      ${stackingRules.length}`);
console.log(`  Application steps:   ${applicationGuidance.length}`);
console.log(`  FTS index entries:   ${ftsCount}`);
console.log(`  Build date:          ${now}`);
