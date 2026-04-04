import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { type Database } from '../../src/db.js';
import { handleGetEligibleItems } from '../../src/tools/get-eligible-items.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-eligible-items.db';

describe('get_eligible_items', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  it('returns items for a valid grant', () => {
    const result = handleGetEligibleItems(db, { grant_id: 'inv-001' }) as any;
    expect(result).toBeDefined();
    expect(result.total).toBeGreaterThan(0);
    expect(result.items.length).toBeGreaterThan(0);
  });

  it('filters by category', () => {
    const result = handleGetEligibleItems(db, { grant_id: 'inv-001', category: 'buildings' }) as any;
    expect(result).toBeDefined();
    expect(result.total).toBeGreaterThan(0);
  });

  it('includes category list', () => {
    const result = handleGetEligibleItems(db, { grant_id: 'inv-001' }) as any;
    expect(result.categories).toBeDefined();
    expect(result.categories.length).toBeGreaterThan(0);
  });

  it('returns error for nonexistent grant', () => {
    const result = handleGetEligibleItems(db, { grant_id: 'nonexistent' });
    expect(result).toHaveProperty('error', 'grant_not_found');
  });

  it('rejects unsupported jurisdiction', () => {
    const result = handleGetEligibleItems(db, { grant_id: 'inv-001', jurisdiction: 'XX' });
    expect(result).toHaveProperty('error');
  });
});
