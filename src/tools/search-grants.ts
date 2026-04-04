import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import { ftsSearch, type Database } from '../db.js';

interface SearchGrantsArgs {
  query: string;
  grant_type?: string;
  min_value?: number;
  jurisdiction?: string;
  limit?: number;
}

export function handleSearchGrants(db: Database, args: SearchGrantsArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  const limit = Math.min(args.limit ?? 20, 50);

  // Try FTS first
  let ftsResults = ftsSearch(db, args.query, limit);

  // Filter by grant_type if provided
  if (args.grant_type && ftsResults.length > 0) {
    ftsResults = ftsResults.filter(r =>
      r.grant_type?.toLowerCase() === args.grant_type!.toLowerCase()
    );
  }

  if (ftsResults.length > 0) {
    // Enrich with full grant data
    const grantIds = ftsResults.map(r => {
      const grant = db.get<{ id: string }>(
        'SELECT id FROM grants WHERE name = ? AND jurisdiction = ?',
        [r.title, jv.jurisdiction]
      );
      return grant?.id;
    }).filter(Boolean);

    const enriched = grantIds.map(id => {
      const grant = db.get<Record<string, unknown>>(
        'SELECT * FROM grants WHERE id = ? AND jurisdiction = ?',
        [id, jv.jurisdiction]
      );
      return grant;
    }).filter(Boolean);

    if (args.min_value !== undefined) {
      return {
        results: enriched.filter((g: any) => g.max_grant_value === null || g.max_grant_value >= args.min_value!),
        total: enriched.length,
        search_tier: 'fts',
        _meta: buildMeta(),
      };
    }

    return {
      results: enriched,
      total: enriched.length,
      search_tier: 'fts',
      _meta: buildMeta(),
    };
  }

  // Direct SQL fallback
  let sql = 'SELECT * FROM grants WHERE jurisdiction = ?';
  const params: unknown[] = [jv.jurisdiction];

  if (args.grant_type) {
    sql += ' AND grant_type = ?';
    params.push(args.grant_type);
  }

  if (args.min_value !== undefined) {
    sql += ' AND (max_grant_value IS NULL OR max_grant_value >= ?)';
    params.push(args.min_value);
  }

  sql += ' LIMIT ?';
  params.push(limit);

  const results = db.all<Record<string, unknown>>(sql, params);

  return {
    results,
    total: results.length,
    search_tier: 'sql',
    _meta: buildMeta(),
  };
}
