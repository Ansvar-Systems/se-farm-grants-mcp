import { buildMeta } from '../metadata.js';
import type { Database } from '../db.js';

interface Source {
  name: string;
  authority: string;
  official_url: string;
  retrieval_method: string;
  update_frequency: string;
  license: string;
  coverage: string;
  last_retrieved?: string;
}

export function handleListSources(db: Database): { sources: Source[]; _meta: ReturnType<typeof buildMeta> } {
  const lastIngest = db.get<{ value: string }>('SELECT value FROM db_metadata WHERE key = ?', ['last_ingest']);

  const sources: Source[] = [
    {
      name: 'Jordbruksverket — Stod och ersattningar',
      authority: 'Jordbruksverket (Swedish Board of Agriculture)',
      official_url: 'https://jordbruksverket.se/stod',
      retrieval_method: 'MANUAL_EXTRACT',
      update_frequency: 'quarterly',
      license: 'Swedish public authority data',
      coverage: 'Investment grants, environmental investments, young farmer support, innovation grants',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'Tillvaxtverket — Landsbygdsutveckling',
      authority: 'Tillvaxtverket (Swedish Agency for Economic and Regional Growth)',
      official_url: 'https://tillvaxtverket.se/eu-program/landsbygdsprogrammet',
      retrieval_method: 'MANUAL_EXTRACT',
      update_frequency: 'quarterly',
      license: 'Swedish public authority data',
      coverage: 'Rural development project grants, broadband support',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'Lansstyrelsen — Regionala stod',
      authority: 'Lansstyrelsen (County Administrative Boards)',
      official_url: 'https://www.lansstyrelsen.se/jordbruk',
      retrieval_method: 'MANUAL_EXTRACT',
      update_frequency: 'quarterly',
      license: 'Swedish public authority data',
      coverage: 'Regional grants, predator protection, environmental measures',
      last_retrieved: lastIngest?.value,
    },
  ];

  return {
    sources,
    _meta: buildMeta({ source_url: 'https://jordbruksverket.se/stod' }),
  };
}
