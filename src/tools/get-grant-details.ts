import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface GetGrantDetailsArgs {
  grant_id: string;
  jurisdiction?: string;
}

export function handleGetGrantDetails(db: Database, args: GetGrantDetailsArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  const grant = db.get<Record<string, unknown>>(
    'SELECT * FROM grants WHERE id = ? AND jurisdiction = ?',
    [args.grant_id, jv.jurisdiction]
  );

  if (!grant) {
    return {
      error: 'grant_not_found',
      grant_id: args.grant_id,
      message: `No grant found with ID '${args.grant_id}'. Use search_grants to find valid IDs.`,
    };
  }

  const items = db.all<Record<string, unknown>>(
    'SELECT * FROM grant_items WHERE grant_id = ? AND jurisdiction = ? ORDER BY category, name',
    [args.grant_id, jv.jurisdiction]
  );

  const guidance = db.all<Record<string, unknown>>(
    'SELECT * FROM application_guidance WHERE grant_id = ? AND jurisdiction = ? ORDER BY step_order',
    [args.grant_id, jv.jurisdiction]
  );

  const stacking = db.all<Record<string, unknown>>(
    `SELECT s.*,
       CASE WHEN s.grant_a = ? THEN g2.name ELSE g1.name END as other_grant_name,
       CASE WHEN s.grant_a = ? THEN s.grant_b ELSE s.grant_a END as other_grant_id
     FROM stacking_rules s
     LEFT JOIN grants g1 ON s.grant_a = g1.id
     LEFT JOIN grants g2 ON s.grant_b = g2.id
     WHERE (s.grant_a = ? OR s.grant_b = ?) AND s.jurisdiction = ?`,
    [args.grant_id, args.grant_id, args.grant_id, args.grant_id, jv.jurisdiction]
  );

  return {
    grant,
    eligible_items: items,
    eligible_items_count: items.length,
    application_steps: guidance,
    stacking_rules: stacking,
    _meta: buildMeta(),
  };
}
