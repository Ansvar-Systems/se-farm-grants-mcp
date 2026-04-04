#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { createDatabase } from './db.js';
import { handleAbout } from './tools/about.js';
import { handleListSources } from './tools/list-sources.js';
import { handleCheckFreshness } from './tools/check-freshness.js';
import { handleSearchGrants } from './tools/search-grants.js';
import { handleGetGrantDetails } from './tools/get-grant-details.js';
import { handleCheckDeadlines } from './tools/check-deadlines.js';
import { handleGetEligibleItems } from './tools/get-eligible-items.js';
import { handleCheckStacking } from './tools/check-stacking.js';
import { handleGetApplicationProcess } from './tools/get-application-process.js';
import { handleEstimateGrantValue } from './tools/estimate-grant-value.js';

const SERVER_NAME = 'se-farm-grants-mcp';
const SERVER_VERSION = '0.1.0';

const TOOLS = [
  {
    name: 'about',
    description: 'Get server metadata: name, version, coverage, data sources, and links.',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'list_sources',
    description: 'List all data sources with authority, URL, license, and freshness info.',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'check_data_freshness',
    description: 'Check when data was last ingested, staleness status, and how to trigger a refresh.',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'search_grants',
    description: 'Search Swedish farm grants and subsidies by keyword, grant type, or minimum value. Returns matching grants with eligibility and status.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Free-text search query (e.g. "stallbyggnad", "solenergi", "ung lantbrukare")' },
        grant_type: { type: 'string', description: 'Filter by type: capital, young_farmer, competitive, infrastructure, revenue, environmental' },
        min_value: { type: 'number', description: 'Minimum grant value in SEK' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: SE)' },
        limit: { type: 'number', description: 'Max results (default: 20, max: 50)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_grant_details',
    description: 'Get full details for a specific grant: description, eligibility, eligible items, application steps, and stacking rules.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        grant_id: { type: 'string', description: 'Grant ID (e.g. "investeringsstod-stallbyggnader")' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: SE)' },
      },
      required: ['grant_id'],
    },
  },
  {
    name: 'check_deadlines',
    description: 'List grant deadlines: open with deadline, rolling/continuous, closed, and upcoming. Sorted by closing date.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        grant_type: { type: 'string', description: 'Filter by type: capital, young_farmer, competitive, infrastructure, revenue, environmental' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: SE)' },
      },
    },
  },
  {
    name: 'get_eligible_items',
    description: 'List eligible cost items for a grant, optionally filtered by category. Shows per-item values and specifications.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        grant_id: { type: 'string', description: 'Grant ID' },
        category: { type: 'string', description: 'Filter by item category (e.g. "building", "equipment", "energy")' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: SE)' },
      },
      required: ['grant_id'],
    },
  },
  {
    name: 'check_stacking',
    description: 'Check if multiple grants can be combined (stacked). Returns compatibility for each pair with conditions.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        grant_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of grant IDs to check compatibility (minimum 2)',
        },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: SE)' },
      },
      required: ['grant_ids'],
    },
  },
  {
    name: 'get_application_process',
    description: 'Get step-by-step application guidance for a grant: what to prepare, evidence needed, which portal to use.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        grant_id: { type: 'string', description: 'Grant ID' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: SE)' },
      },
      required: ['grant_id'],
    },
  },
  {
    name: 'estimate_grant_value',
    description: 'Estimate grant payout for specific items and/or area. Applies match funding percentage and max caps.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        grant_id: { type: 'string', description: 'Grant ID' },
        items: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of grant item IDs to include in estimate',
        },
        area_ha: { type: 'number', description: 'Farm area in hectares (for per-hectare items)' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: SE)' },
      },
      required: ['grant_id'],
    },
  },
];

const SearchArgsSchema = z.object({
  query: z.string(),
  grant_type: z.string().optional(),
  min_value: z.number().optional(),
  jurisdiction: z.string().optional(),
  limit: z.number().optional(),
});

const GrantDetailsArgsSchema = z.object({
  grant_id: z.string(),
  jurisdiction: z.string().optional(),
});

const DeadlinesArgsSchema = z.object({
  grant_type: z.string().optional(),
  jurisdiction: z.string().optional(),
});

const EligibleItemsArgsSchema = z.object({
  grant_id: z.string(),
  category: z.string().optional(),
  jurisdiction: z.string().optional(),
});

const StackingArgsSchema = z.object({
  grant_ids: z.array(z.string()),
  jurisdiction: z.string().optional(),
});

const ApplicationProcessArgsSchema = z.object({
  grant_id: z.string(),
  jurisdiction: z.string().optional(),
});

const EstimateValueArgsSchema = z.object({
  grant_id: z.string(),
  items: z.array(z.string()).optional(),
  area_ha: z.number().optional(),
  jurisdiction: z.string().optional(),
});

function textResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

function errorResult(message: string) {
  return { content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }], isError: true };
}

const db = createDatabase();

const server = new Server(
  { name: SERVER_NAME, version: SERVER_VERSION },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {
      case 'about':
        return textResult(handleAbout());
      case 'list_sources':
        return textResult(handleListSources(db));
      case 'check_data_freshness':
        return textResult(handleCheckFreshness(db));
      case 'search_grants':
        return textResult(handleSearchGrants(db, SearchArgsSchema.parse(args)));
      case 'get_grant_details':
        return textResult(handleGetGrantDetails(db, GrantDetailsArgsSchema.parse(args)));
      case 'check_deadlines':
        return textResult(handleCheckDeadlines(db, DeadlinesArgsSchema.parse(args)));
      case 'get_eligible_items':
        return textResult(handleGetEligibleItems(db, EligibleItemsArgsSchema.parse(args)));
      case 'check_stacking':
        return textResult(handleCheckStacking(db, StackingArgsSchema.parse(args)));
      case 'get_application_process':
        return textResult(handleGetApplicationProcess(db, ApplicationProcessArgsSchema.parse(args)));
      case 'estimate_grant_value':
        return textResult(handleEstimateGrantValue(db, EstimateValueArgsSchema.parse(args)));
      default:
        return errorResult(`Unknown tool: ${name}`);
    }
  } catch (err) {
    return errorResult(err instanceof Error ? err.message : String(err));
  }
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write(`Fatal error: ${err.message}\n`);
  process.exit(1);
});
