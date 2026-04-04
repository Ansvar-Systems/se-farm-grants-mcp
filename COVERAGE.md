# Coverage

## What Is Included

- **Grant schemes** -- Investment support, environmental investments, young farmer schemes, rural development grants, predator protection, broadband support
- **Grant details** -- Name, type, authority, budget, status (open/closed/rolling), open/close dates, eligibility criteria, match funding percentages, maximum grant values
- **Eligible items** -- Item-level breakdowns with codes, descriptions, specifications, grant values, units (SEK, SEK/ha), and categories
- **Stacking rules** -- Pairwise compatibility checks between grants with conditions
- **Application guidance** -- Step-by-step application processes with evidence requirements and portal links
- **Deadline tracking** -- Categorised deadlines: open with deadline, open rolling, closed, upcoming
- **Grant value estimation** -- Estimated values based on selected items, area, and match funding percentages
- **Full-text search** -- Tiered FTS5 search across grant names, descriptions, and types

## Jurisdictions

| Code | Country | Status |
|------|---------|--------|
| SE | Sweden | Supported |

## Data Sources

| Source | Authority | Coverage |
|--------|-----------|----------|
| Jordbruksverket | Swedish Board of Agriculture | Investment support, environmental investments, young farmer schemes |
| Tillvaxtverket | Swedish Agency for Economic & Regional Growth | Rural development project grants, broadband support |
| Lansstyrelsen | County Administrative Boards | Regional grants, predator protection, environmental measures |

## What Is NOT Included

- **Real-time budget availability** -- Grant budgets may be exhausted before the close date
- **Individual eligibility assessment** -- This provides scheme-level criteria, not applicant-specific determination
- **Historical grant rounds** -- Only current/recent rounds are included
- **EU-level CAP programme details** -- Swedish implementation only, not the EU framework directly
- **Tax implications** -- Grant taxation treatment is not covered
- **Other Nordic countries** -- Sweden only

## Known Gaps

1. Grant scheme availability changes quarterly -- check Jordbruksverket e-tjanster for current status
2. Stacking rules may not cover all possible grant combinations
3. Grant value estimates are indicative; actual payments depend on detailed assessment
4. Some regional Lansstyrelsen grants may not be fully captured
5. FTS5 search works best with Swedish terms (e.g. "investeringsstod", "miljoinvestering") rather than English

## Data Freshness

Run `check_data_freshness` to see when data was last updated. Staleness threshold is 90 days. Manual refresh: `gh workflow run ingest.yml`.
