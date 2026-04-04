import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface EstimateGrantValueArgs {
  grant_id: string;
  items?: string[];
  area_ha?: number;
  jurisdiction?: string;
}

export function handleEstimateGrantValue(db: Database, args: EstimateGrantValueArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  const grant = db.get<{
    id: string;
    name: string;
    match_funding_pct: number | null;
    max_grant_value: number | null;
    grant_type: string;
  }>(
    'SELECT id, name, match_funding_pct, max_grant_value, grant_type FROM grants WHERE id = ? AND jurisdiction = ?',
    [args.grant_id, jv.jurisdiction]
  );

  if (!grant) {
    return {
      error: 'grant_not_found',
      grant_id: args.grant_id,
      message: `No grant found with ID '${args.grant_id}'. Use search_grants to find valid IDs.`,
    };
  }

  let itemsTotal = 0;
  const itemBreakdown: Record<string, unknown>[] = [];

  if (args.items && args.items.length > 0) {
    for (const itemId of args.items) {
      const item = db.get<{
        id: string;
        name: string;
        grant_value: number | null;
        grant_unit: string | null;
      }>(
        'SELECT id, name, grant_value, grant_unit FROM grant_items WHERE id = ? AND grant_id = ? AND jurisdiction = ?',
        [itemId, args.grant_id, jv.jurisdiction]
      );

      if (item && item.grant_value) {
        let value = item.grant_value;
        if (item.grant_unit === 'SEK/ha' && args.area_ha) {
          value = item.grant_value * args.area_ha;
        }
        itemsTotal += value;
        itemBreakdown.push({
          item_id: item.id,
          name: item.name,
          unit_value: item.grant_value,
          unit: item.grant_unit,
          calculated_value: value,
        });
      } else if (!item) {
        itemBreakdown.push({
          item_id: itemId,
          error: 'Item not found for this grant',
        });
      }
    }
  }

  // Apply match funding percentage cap
  let estimatedGrant = itemsTotal;
  if (grant.match_funding_pct && itemsTotal > 0) {
    estimatedGrant = itemsTotal * (grant.match_funding_pct / 100);
  }

  // Apply max cap
  if (grant.max_grant_value && estimatedGrant > grant.max_grant_value) {
    estimatedGrant = grant.max_grant_value;
  }

  return {
    grant_id: args.grant_id,
    grant_name: grant.name,
    match_funding_pct: grant.match_funding_pct,
    max_grant_value: grant.max_grant_value,
    items_breakdown: itemBreakdown,
    items_total: itemsTotal,
    estimated_grant_value: estimatedGrant,
    area_ha: args.area_ha ?? null,
    currency: 'SEK',
    note: 'This is an indicative estimate only. Actual grant value depends on Jordbruksverket assessment. ' +
      'Match funding percentage applies to eligible costs as determined by the authority.',
    _meta: buildMeta(),
  };
}
