import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { type Database } from '../../src/db.js';
import { handleGetGrantDetails } from '../../src/tools/get-grant-details.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-grant-details.db';

describe('get_grant_details', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  it('returns details for a valid grant ID', () => {
    const result = handleGetGrantDetails(db, { grant_id: 'inv-001' }) as any;
    expect(result).toBeDefined();
    expect(result.grant).toBeDefined();
    expect(result.grant.name).toBe('Investeringsstod for djurstall');
  });

  it('includes eligible items', () => {
    const result = handleGetGrantDetails(db, { grant_id: 'inv-001' }) as any;
    expect(result.eligible_items).toBeDefined();
    expect(result.eligible_items_count).toBeGreaterThan(0);
  });

  it('includes application steps', () => {
    const result = handleGetGrantDetails(db, { grant_id: 'inv-001' }) as any;
    expect(result.application_steps).toBeDefined();
    expect(result.application_steps.length).toBeGreaterThan(0);
  });

  it('includes stacking rules', () => {
    const result = handleGetGrantDetails(db, { grant_id: 'inv-001' }) as any;
    expect(result.stacking_rules).toBeDefined();
    expect(result.stacking_rules.length).toBeGreaterThan(0);
  });

  it('returns error for nonexistent grant', () => {
    const result = handleGetGrantDetails(db, { grant_id: 'nonexistent' });
    expect(result).toHaveProperty('error', 'grant_not_found');
  });

  it('rejects unsupported jurisdiction', () => {
    const result = handleGetGrantDetails(db, { grant_id: 'inv-001', jurisdiction: 'XX' });
    expect(result).toHaveProperty('error');
  });
});
