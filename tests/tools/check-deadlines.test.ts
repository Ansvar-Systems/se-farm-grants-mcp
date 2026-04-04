import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { type Database } from '../../src/db.js';
import { handleCheckDeadlines } from '../../src/tools/check-deadlines.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-deadlines.db';

describe('check_deadlines', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  it('returns categorised deadlines', () => {
    const result = handleCheckDeadlines(db, {}) as any;
    expect(result).toBeDefined();
    // Should have at least one of the categories
    expect(result).toHaveProperty('open_with_deadline');
    expect(result).toHaveProperty('open_rolling');
    expect(result).toHaveProperty('closed');
    expect(result).toHaveProperty('upcoming');
  });

  it('filters by grant type', () => {
    const result = handleCheckDeadlines(db, { grant_type: 'investment' }) as any;
    expect(result).toBeDefined();
  });

  it('rejects unsupported jurisdiction', () => {
    const result = handleCheckDeadlines(db, { jurisdiction: 'XX' });
    expect(result).toHaveProperty('error');
  });
});
