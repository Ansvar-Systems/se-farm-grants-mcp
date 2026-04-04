import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { type Database } from '../../src/db.js';
import { handleEstimateGrantValue } from '../../src/tools/estimate-grant-value.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-estimate-value.db';

describe('estimate_grant_value', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  it('returns estimate for a valid grant with items', () => {
    const result = handleEstimateGrantValue(db, { grant_id: 'inv-001', items: ['item-002'] }) as any;
    expect(result).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  it('returns grant info including match funding', () => {
    const result = handleEstimateGrantValue(db, { grant_id: 'inv-001' }) as any;
    expect(result).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  it('returns error for nonexistent grant', () => {
    const result = handleEstimateGrantValue(db, { grant_id: 'nonexistent' });
    expect(result).toHaveProperty('error', 'grant_not_found');
  });

  it('rejects unsupported jurisdiction', () => {
    const result = handleEstimateGrantValue(db, { grant_id: 'inv-001', jurisdiction: 'XX' });
    expect(result).toHaveProperty('error');
  });
});
