# Tools Reference

## Meta Tools

### `about`

Get server metadata: name, version, coverage, data sources, and links.

**Parameters:** None

**Returns:** Server name, version, jurisdiction list, data source names (3 sources), tool count, homepage/repository links.

---

### `list_sources`

List all data sources with authority, URL, license, and freshness info.

**Parameters:** None

**Returns:** Array of 3 sources (Jordbruksverket, Tillvaxtverket, Lansstyrelsen), each with `name`, `authority`, `official_url`, `retrieval_method`, `update_frequency`, `license`, `coverage`, `last_retrieved`.

---

### `check_data_freshness`

Check when data was last ingested, staleness status, and how to trigger a refresh.

**Parameters:** None

**Returns:** `status` (fresh/stale/unknown), `last_ingest`, `build_date`, `schema_version`, `days_since_ingest`, `staleness_threshold_days` (90), `refresh_command`.

---

## Domain Tools

### `search_grants`

Search grant schemes by name, description, or type. Uses tiered FTS5 search.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Free-text search query |
| `grant_type` | string | No | Filter by grant type |
| `min_value` | number | No | Minimum grant value (SEK) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: SE) |
| `limit` | number | No | Max results (default: 20, max: 50) |

**Returns:** `results` array of matching grants with full grant details, `total` count, `search_tier`.

**Example:** `{ "query": "investeringsstod djurhallning" }`

---

### `get_grant_details`

Get full details for a specific grant including eligible items, application steps, and stacking rules.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `grant_id` | string | Yes | Grant ID (from search results) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: SE) |

**Returns:** `grant` object with all fields, `eligible_items` array, `eligible_items_count`, `application_steps` array, `stacking_rules` array with other grant compatibility.

**Example:** `{ "grant_id": "inv-001" }`

---

### `check_deadlines`

Check grant deadlines, categorised by status: open with deadline, open rolling, closed, upcoming.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `grant_type` | string | No | Filter by grant type |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: SE) |

**Returns:** Categorised object with `open_with_deadline`, `open_rolling`, `closed`, `upcoming` arrays. Each entry includes `days_until_close` where applicable.

**Example:** `{ "grant_type": "investment" }`

---

### `get_eligible_items`

Get eligible items for a specific grant, optionally filtered by category.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `grant_id` | string | Yes | Grant ID |
| `category` | string | No | Filter by item category |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: SE) |

**Returns:** `grant_name`, `items` array with item details, `total` count, `categories` list.

**Example:** `{ "grant_id": "inv-001", "category": "buildings" }`

---

### `check_stacking`

Check compatibility between two or more grants (can they be combined?).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `grant_ids` | string[] | Yes | Array of 2+ grant IDs to check |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: SE) |

**Returns:** Array of pairwise checks with `grant_a`, `grant_b`, names, `compatible` (boolean or null if no rule), `conditions`, `rule_found`.

**Example:** `{ "grant_ids": ["inv-001", "env-002"] }`

---

### `get_application_process`

Get step-by-step application process for a specific grant.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `grant_id` | string | Yes | Grant ID |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: SE) |

**Returns:** `grant_name`, `authority`, `steps` array with `step_order`, `description`, `evidence_required`, `portal`, `total_steps`, `primary_portal` URL.

**Example:** `{ "grant_id": "inv-001" }`

---

### `estimate_grant_value`

Estimate grant value based on selected items, area, and match funding percentage.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `grant_id` | string | Yes | Grant ID |
| `items` | string[] | No | Array of item IDs to include in estimate |
| `area_ha` | number | No | Area in hectares (for per-ha calculations) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: SE) |

**Returns:** Grant details, `match_funding_pct`, `max_grant_value`, `item_breakdown` with per-item values, `items_total`, estimated grant value (capped at maximum).

**Example:** `{ "grant_id": "inv-001", "items": ["item-001", "item-002"], "area_ha": 50 }`
