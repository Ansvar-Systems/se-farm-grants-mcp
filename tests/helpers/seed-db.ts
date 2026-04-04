import { createDatabase, type Database } from '../../src/db.js';

export function createSeededDatabase(dbPath: string): Database {
  const db = createDatabase(dbPath);

  // Grants
  db.run(
    `INSERT INTO grants (id, name, grant_type, authority, budget, status, open_date, close_date, description, eligible_applicants, match_funding_pct, max_grant_value, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['inv-001', 'Investeringsstod for djurstall', 'investment', 'Jordbruksverket', '500 MSEK', 'open', '2026-01-15', '2026-06-30', 'Stod for nybyggnad eller renovering av djurstallar', 'Lantbrukare med djurhallning', 40, 1200000, 'SE']
  );
  db.run(
    `INSERT INTO grants (id, name, grant_type, authority, budget, status, open_date, close_date, description, eligible_applicants, match_funding_pct, max_grant_value, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['env-001', 'Miljoinvestering vatmarker', 'environmental', 'Jordbruksverket', '200 MSEK', 'open', '2026-02-01', '2026-09-30', 'Stod for anlaggning av vatmarker', 'Markagare', 100, 500000, 'SE']
  );
  db.run(
    `INSERT INTO grants (id, name, grant_type, authority, budget, status, open_date, close_date, description, eligible_applicants, match_funding_pct, max_grant_value, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['yf-001', 'Startbidrag unga lantbrukare', 'young_farmer', 'Jordbruksverket', '100 MSEK', 'rolling', '2026-01-01', null, 'Etableringsbidraget for lantbrukare under 40 ar', 'Forstforetagare under 40 ar', null, 250000, 'SE']
  );

  // Grant items
  db.run(
    `INSERT INTO grant_items (id, grant_id, item_code, name, description, specification, grant_value, grant_unit, category, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['item-001', 'inv-001', 'INV-STALL-01', 'Nybyggnad djurstall', 'Nybyggnad av stallanlaggning', 'Per kvadratmeter stallyta', 3000, 'SEK/m2', 'buildings', 'SE']
  );
  db.run(
    `INSERT INTO grant_items (id, grant_id, item_code, name, description, specification, grant_value, grant_unit, category, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['item-002', 'inv-001', 'INV-STALL-02', 'Ventilationssystem', 'Installation av ventilation', 'Per djurstall', 150000, 'SEK', 'equipment', 'SE']
  );
  db.run(
    `INSERT INTO grant_items (id, grant_id, item_code, name, description, specification, grant_value, grant_unit, category, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['item-003', 'env-001', 'ENV-VATMARK-01', 'Vatmarksanlaggning', 'Anlaggning av vatmark', 'Per hektar vatmarksyta', 50000, 'SEK/ha', 'construction', 'SE']
  );

  // Stacking rules
  db.run(
    `INSERT INTO stacking_rules (grant_a, grant_b, compatible, conditions, jurisdiction)
     VALUES (?, ?, ?, ?, ?)`,
    ['inv-001', 'env-001', 1, 'Kan kombineras om investeringen inkluderar miljoatgard', 'SE']
  );
  db.run(
    `INSERT INTO stacking_rules (grant_a, grant_b, compatible, conditions, jurisdiction)
     VALUES (?, ?, ?, ?, ?)`,
    ['inv-001', 'yf-001', 1, 'Unga lantbrukare kan kombinera med investeringsstod', 'SE']
  );

  // Application guidance
  db.run(
    `INSERT INTO application_guidance (grant_id, step_order, description, evidence_required, portal, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['inv-001', 1, 'Ansok via Jordbruksverkets e-tjanst', 'Foretagsuppgifter, organisationsnummer', 'https://jordbruksverket.se/e-tjanster', 'SE']
  );
  db.run(
    `INSERT INTO application_guidance (grant_id, step_order, description, evidence_required, portal, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['inv-001', 2, 'Bifoga affarsplan och kostnadsunderlag', 'Affarsplan, offerter, ritningar', null, 'SE']
  );
  db.run(
    `INSERT INTO application_guidance (grant_id, step_order, description, evidence_required, portal, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['inv-001', 3, 'Invanta beslut fran Lansstyrelsen', null, null, 'SE']
  );

  // FTS5 search index
  db.run(
    `INSERT INTO search_index (title, body, grant_type, jurisdiction) VALUES (?, ?, ?, ?)`,
    ['Investeringsstod for djurstall', 'Stod for nybyggnad eller renovering av djurstallar. Jordbruksverket investeringsstod.', 'investment', 'SE']
  );
  db.run(
    `INSERT INTO search_index (title, body, grant_type, jurisdiction) VALUES (?, ?, ?, ?)`,
    ['Miljoinvestering vatmarker', 'Stod for anlaggning av vatmarker. Miljoersattning och naturvard.', 'environmental', 'SE']
  );
  db.run(
    `INSERT INTO search_index (title, body, grant_type, jurisdiction) VALUES (?, ?, ?, ?)`,
    ['Startbidrag unga lantbrukare', 'Etableringsbidraget for lantbrukare under 40 ar. Unga lantbrukare.', 'young_farmer', 'SE']
  );

  return db;
}
