import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { type Database } from '../../src/db.js';
import { handleCheckStacking } from '../../src/tools/check-stacking.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-stacking.db';

describe('check_stacking', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  it('returns compatibility for two valid grants', () => {
    const result = handleCheckStacking(db, { grant_ids: ['inv-001', 'env-001'] }) as any;
    expect(result).toBeDefined();
    expect(result.pairs ?? result.checks ?? result.stacking_results).toBeDefined();
  });

  it('returns compatible=true for inv-001 and env-001', () => {
    const result = handleCheckStacking(db, { grant_ids: ['inv-001', 'env-001'] }) as any;
    const pairs = result.pairs ?? result.checks ?? result.stacking_results ?? [];
    expect(pairs.length).toBeGreaterThan(0);
    expect(pairs[0].compatible).toBe(true);
  });

  it('rejects less than 2 grant IDs', () => {
    const result = handleCheckStacking(db, { grant_ids: ['inv-001'] }) as any;
    expect(result).toHaveProperty('error', 'invalid_input');
  });

  it('returns error for nonexistent grant', () => {
    const result = handleCheckStacking(db, { grant_ids: ['inv-001', 'nonexistent'] }) as any;
    expect(result).toHaveProperty('error', 'grant_not_found');
  });

  it('rejects unsupported jurisdiction', () => {
    const result = handleCheckStacking(db, { grant_ids: ['inv-001', 'env-001'], jurisdiction: 'XX' });
    expect(result).toHaveProperty('error');
  });
});
