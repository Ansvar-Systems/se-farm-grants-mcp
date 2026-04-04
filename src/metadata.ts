export interface Meta {
  disclaimer: string;
  data_age: string;
  source_url: string;
  copyright: string;
  server: string;
  version: string;
}

const DISCLAIMER =
  'This data is provided for informational purposes only. It does not constitute professional ' +
  'financial or agricultural advice. Always verify grant conditions with the issuing authority ' +
  'before applying. Data sourced from Jordbruksverket, Tillvaxtverket, and Lansstyrelsen ' +
  'public publications.';

export function buildMeta(overrides?: Partial<Meta>): Meta {
  return {
    disclaimer: DISCLAIMER,
    data_age: overrides?.data_age ?? 'unknown',
    source_url: overrides?.source_url ?? 'https://jordbruksverket.se/stod',
    copyright: 'Data: Swedish public authority publications. Server: Apache-2.0 Ansvar Systems.',
    server: 'se-farm-grants-mcp',
    version: '0.1.0',
    ...overrides,
  };
}
