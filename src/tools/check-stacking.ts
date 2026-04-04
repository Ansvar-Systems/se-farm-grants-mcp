import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface CheckStackingArgs {
  grant_ids: string[];
  jurisdiction?: string;
}

export function handleCheckStacking(db: Database, args: CheckStackingArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  if (!args.grant_ids || args.grant_ids.length < 2) {
    return {
      error: 'invalid_input',
      message: 'Provide at least 2 grant IDs to check stacking compatibility.',
    };
  }

  // Verify all grants exist
  const grantDetails: Record<string, string> = {};
  for (const id of args.grant_ids) {
    const grant = db.get<{ id: string; name: string }>(
      'SELECT id, name FROM grants WHERE id = ? AND jurisdiction = ?',
      [id, jv.jurisdiction]
    );
    if (!grant) {
      return {
        error: 'grant_not_found',
        grant_id: id,
        message: `No grant found with ID '${id}'. Use search_grants to find valid IDs.`,
      };
    }
    grantDetails[id] = grant.name;
  }

  // Check all pairs
  const pairs: Record<string, unknown>[] = [];
  for (let i = 0; i < args.grant_ids.length; i++) {
    for (let j = i + 1; j < args.grant_ids.length; j++) {
      const a = args.grant_ids[i];
      const b = args.grant_ids[j];

      const rule = db.get<{ compatible: number; conditions: string | null }>(
        `SELECT compatible, conditions FROM stacking_rules
         WHERE ((grant_a = ? AND grant_b = ?) OR (grant_a = ? AND grant_b = ?))
         AND jurisdiction = ?`,
        [a, b, b, a, jv.jurisdiction]
      );

      pairs.push({
        grant_a: a,
        grant_a_name: grantDetails[a],
        grant_b: b,
        grant_b_name: grantDetails[b],
        compatible: rule ? Boolean(rule.compatible) : null,
        conditions: rule?.conditions ?? null,
        rule_found: Boolean(rule),
      });
    }
  }

  const allCompatible = pairs.every(p => p.compatible === true || p.compatible === null);
  const anyIncompatible = pairs.some(p => p.compatible === false);

  return {
    grant_ids: args.grant_ids,
    grants: grantDetails,
    pairs,
    summary: anyIncompatible
      ? 'One or more grant combinations are incompatible. See pair details.'
      : allCompatible
        ? 'All checked grant combinations appear compatible (subject to conditions).'
        : 'Some combinations have no explicit stacking rule. Contact the authority to confirm.',
    _meta: buildMeta(),
  };
}
