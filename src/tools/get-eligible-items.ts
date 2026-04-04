import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface GetEligibleItemsArgs {
  grant_id: string;
  category?: string;
  jurisdiction?: string;
}

export function handleGetEligibleItems(db: Database, args: GetEligibleItemsArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  // Verify grant exists
  const grant = db.get<{ id: string; name: string }>(
    'SELECT id, name FROM grants WHERE id = ? AND jurisdiction = ?',
    [args.grant_id, jv.jurisdiction]
  );

  if (!grant) {
    return {
      error: 'grant_not_found',
      grant_id: args.grant_id,
      message: `No grant found with ID '${args.grant_id}'. Use search_grants to find valid IDs.`,
    };
  }

  let sql = 'SELECT * FROM grant_items WHERE grant_id = ? AND jurisdiction = ?';
  const params: unknown[] = [args.grant_id, jv.jurisdiction];

  if (args.category) {
    sql += ' AND category = ?';
    params.push(args.category);
  }

  sql += ' ORDER BY category, name';

  const items = db.all<Record<string, unknown>>(sql, params);

  // Get distinct categories for this grant
  const categories = db.all<{ category: string }>(
    'SELECT DISTINCT category FROM grant_items WHERE grant_id = ? AND jurisdiction = ? ORDER BY category',
    [args.grant_id, jv.jurisdiction]
  );

  return {
    grant_id: args.grant_id,
    grant_name: grant.name,
    items,
    total: items.length,
    categories: categories.map(c => c.category),
    _meta: buildMeta(),
  };
}
