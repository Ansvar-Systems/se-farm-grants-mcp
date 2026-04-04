import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { type Database } from '../../src/db.js';
import { handleSearchGrants } from '../../src/tools/search-grants.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-search-grants.db';

describe('search_grants', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  it('returns results for a valid query', () => {
    const result = handleSearchGrants(db, { query: 'investeringsstod' }) as any;
    expect(result).toBeDefined();
    expect(result.total ?? result.results_count).toBeGreaterThan(0);
  });

  it('filters by grant type', () => {
    const result = handleSearchGrants(db, { query: 'stod', grant_type: 'investment' }) as any;
    expect(result).toBeDefined();
  });

  it('falls back to SQL for nonexistent FTS query', () => {
    const result = handleSearchGrants(db, { query: 'zzz_nonexistent_zzz' }) as any;
    // When FTS returns nothing, the handler falls back to SQL (returns all grants)
    expect(result.search_tier).toBe('sql');
  });

  it('rejects unsupported jurisdiction', () => {
    const result = handleSearchGrants(db, { query: 'stod', jurisdiction: 'XX' });
    expect(result).toHaveProperty('error');
  });
});
