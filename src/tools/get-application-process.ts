import { buildCitation } from '../citation.js';
import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface GetApplicationProcessArgs {
  grant_id: string;
  jurisdiction?: string;
}

export function handleGetApplicationProcess(db: Database, args: GetApplicationProcessArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  const grant = db.get<{ id: string; name: string; authority: string }>(
    'SELECT id, name, authority FROM grants WHERE id = ? AND jurisdiction = ?',
    [args.grant_id, jv.jurisdiction]
  );

  if (!grant) {
    return {
      error: 'grant_not_found',
      grant_id: args.grant_id,
      message: `No grant found with ID '${args.grant_id}'. Use search_grants to find valid IDs.`,
    };
  }

  const steps = db.all<{
    step_order: number;
    description: string;
    evidence_required: string | null;
    portal: string | null;
  }>(
    'SELECT step_order, description, evidence_required, portal FROM application_guidance WHERE grant_id = ? AND jurisdiction = ? ORDER BY step_order',
    [args.grant_id, jv.jurisdiction]
  );

  return {
    grant_id: args.grant_id,
    grant_name: grant.name,
    authority: grant.authority,
    steps,
    total_steps: steps.length,
    primary_portal: steps.find(s => s.portal)?.portal ?? 'https://jordbruksverket.se/e-tjanster',
    _citation: buildCitation(`SE application process — ${args.grant_id ?? ''}`, `application process (${args.grant_id ?? ''})`, 'get_application_process', { grant_id: String(args.grant_id ?? '') }),
    _meta: buildMeta(),
  };
}
