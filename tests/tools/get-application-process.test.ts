import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { type Database } from '../../src/db.js';
import { handleGetApplicationProcess } from '../../src/tools/get-application-process.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-application-process.db';

describe('get_application_process', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  it('returns application steps for a valid grant', () => {
    const result = handleGetApplicationProcess(db, { grant_id: 'inv-001' }) as any;
    expect(result).toBeDefined();
    expect(result.steps).toBeDefined();
    expect(result.total_steps).toBeGreaterThan(0);
  });

  it('steps are ordered', () => {
    const result = handleGetApplicationProcess(db, { grant_id: 'inv-001' }) as any;
    for (let i = 1; i < result.steps.length; i++) {
      expect(result.steps[i].step_order).toBeGreaterThan(result.steps[i - 1].step_order);
    }
  });

  it('includes primary portal URL', () => {
    const result = handleGetApplicationProcess(db, { grant_id: 'inv-001' }) as any;
    expect(result.primary_portal).toBeDefined();
    expect(result.primary_portal).toContain('jordbruksverket');
  });

  it('returns error for nonexistent grant', () => {
    const result = handleGetApplicationProcess(db, { grant_id: 'nonexistent' });
    expect(result).toHaveProperty('error', 'grant_not_found');
  });

  it('rejects unsupported jurisdiction', () => {
    const result = handleGetApplicationProcess(db, { grant_id: 'inv-001', jurisdiction: 'XX' });
    expect(result).toHaveProperty('error');
  });
});
