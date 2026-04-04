import { buildMeta } from '../metadata.js';
import { SUPPORTED_JURISDICTIONS } from '../jurisdiction.js';

export function handleAbout() {
  return {
    name: 'Sweden Farm Grants MCP',
    description:
      'Swedish agricultural grants and subsidies. Covers Jordbruksverket investment support, ' +
      'rural development grants, environmental investments, and young farmer schemes. ' +
      'Includes eligibility, deadlines, stacking rules, and application guidance.',
    version: '0.1.0',
    jurisdiction: [...SUPPORTED_JURISDICTIONS],
    data_sources: [
      'Jordbruksverket (Swedish Board of Agriculture)',
      'Tillvaxtverket (Swedish Agency for Economic and Regional Growth)',
      'Lansstyrelsen (County Administrative Boards)',
    ],
    tools_count: 10,
    links: {
      homepage: 'https://ansvar.eu/open-agriculture',
      repository: 'https://github.com/ansvar-systems/se-farm-grants-mcp',
      mcp_network: 'https://ansvar.ai/mcp',
    },
    _meta: buildMeta(),
  };
}
