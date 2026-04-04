# Sweden Farm Grants MCP

Swedish agricultural grants and subsidies: investment support, rural development, environmental investments, and young farmer schemes. Query Swedish farm grant data through the [Model Context Protocol](https://modelcontextprotocol.io).

> **Data sources:** Jordbruksverket (Swedish Board of Agriculture), Tillvaxtverket (Swedish Agency for Economic and Regional Growth), Lansstyrelsen (County Administrative Boards). Licensed under applicable Swedish open data terms.

## Quick Start

### Claude Desktop / Claude Code

```json
{
  "mcpServers": {
    "se-farm-grants": {
      "command": "npx",
      "args": ["-y", "@ansvar/se-farm-grants-mcp"]
    }
  }
}
```

### Streamable HTTP (Docker)

```
https://mcp.ansvar.eu/se-farm-grants/mcp
```

## Tools

| Tool | Description |
|------|-------------|
| `about` | Get server metadata: name, version, coverage, data sources, and links. |
| `list_sources` | List all data sources with authority, URL, license, and freshness info. |
| `check_data_freshness` | Check when data was last ingested, staleness status, and how to trigger a refresh. |
| `search_grants` | Search Swedish farm grants and subsidies by keyword, grant type, or minimum value. |
| `get_grant_details` | Get full details for a specific grant: eligibility, items, application steps, stacking rules. |
| `check_deadlines` | List grant deadlines: open, rolling, closed, and upcoming. Sorted by closing date. |
| `get_eligible_items` | List eligible cost items for a grant, optionally filtered by category. |
| `check_stacking` | Check if multiple grants can be combined (stacked) with compatibility conditions. |
| `get_application_process` | Get step-by-step application guidance: what to prepare, evidence needed, which portal. |
| `estimate_grant_value` | Estimate grant payout for specific items and area, applying match funding and caps. |

## Example Queries

- "Vilka stod kan jag soka for investeringar i jordbruket?" (What grants can I apply for regarding farm investments?)
- "What are the deadlines for Jordbruksverket investment support?"
- "Kan jag kombinera miljoersattning med investeringsstod?" (Can I combine environmental payments with investment support?)
- "How much grant can I get for a new livestock building?"

## Stats

| Metric | Value |
|--------|-------|
| Jurisdiction | SE (Sweden) |
| Tools | 10 |
| Transport | stdio + Streamable HTTP |
| License | Apache-2.0 |

## Links

- [Ansvar MCP Network](https://ansvar.eu/open-agriculture)
- [GitHub](https://github.com/ansvar-systems/se-farm-grants-mcp)
- [All Swedish Agriculture MCPs](https://mcp.ansvar.eu)
