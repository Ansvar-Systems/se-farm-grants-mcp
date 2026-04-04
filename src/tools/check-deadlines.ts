import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface CheckDeadlinesArgs {
  grant_type?: string;
  jurisdiction?: string;
}

export function handleCheckDeadlines(db: Database, args: CheckDeadlinesArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  let sql = 'SELECT id, name, grant_type, status, open_date, close_date, authority FROM grants WHERE jurisdiction = ?';
  const params: unknown[] = [jv.jurisdiction];

  if (args.grant_type) {
    sql += ' AND grant_type = ?';
    params.push(args.grant_type);
  }

  sql += ' ORDER BY close_date ASC';

  const grants = db.all<{
    id: string;
    name: string;
    grant_type: string;
    status: string;
    open_date: string | null;
    close_date: string | null;
    authority: string;
  }>(sql, params);

  const now = new Date().toISOString().split('T')[0];

  const categorized = {
    open_with_deadline: [] as Record<string, unknown>[],
    open_rolling: [] as Record<string, unknown>[],
    closed: [] as Record<string, unknown>[],
    upcoming: [] as Record<string, unknown>[],
  };

  for (const g of grants) {
    const entry = {
      ...g,
      days_until_close: g.close_date ? daysBetween(now, g.close_date) : null,
    };

    if (g.status === 'open' && g.close_date && g.close_date >= now) {
      categorized.open_with_deadline.push(entry);
    } else if (g.status === 'open' || g.status === 'rolling') {
      categorized.open_rolling.push(entry);
    } else if (g.status === 'closed' || (g.close_date && g.close_date < now)) {
      categorized.closed.push(entry);
    } else {
      categorized.upcoming.push(entry);
    }
  }

  return {
    as_of: now,
    ...categorized,
    total: grants.length,
    _meta: buildMeta(),
  };
}

function daysBetween(from: string, to: string): number {
  const a = new Date(from);
  const b = new Date(to);
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}
