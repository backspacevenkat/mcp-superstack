/**
 * Memory MCP Server Wrapper
 *
 * Knowledge graph for storing entities and relationships.
 *
 * @example
 * ```typescript
 * import { memory } from 'mcp-superstack';
 *
 * await memory.initialize();
 *
 * await memory.createEntities([{
 *   name: 'user-123',
 *   entityType: 'user',
 *   observations: ['Prefers dark mode', 'Uses TypeScript']
 * }]);
 * ```
 */

import { initializeServer, callMCPTool } from '../../client.js';

const SERVER_NAME = 'memory';

/**
 * Initialize the Memory server
 */
export async function initialize(): Promise<void> {
  await initializeServer(SERVER_NAME);
}

/**
 * Entity definition
 */
export interface Entity {
  name: string;
  entityType: string;
  observations?: string[];
}

/**
 * Relation definition
 */
export interface Relation {
  from: string;
  to: string;
  relationType: string;
}

/**
 * Create entities in the knowledge graph
 */
export async function createEntities(entities: Entity[]): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'create_entities', {
    entities,
  });
}

/**
 * Create relations between entities
 */
export async function createRelations(relations: Relation[]): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'create_relations', {
    relations,
  });
}

/**
 * Add observations to an entity
 */
export async function addObservations(entityName: string, observations: string[]): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'add_observations', {
    entityName,
    observations,
  });
}

/**
 * Search for nodes in the graph
 */
export async function searchNodes(query: string): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'search_nodes', {
    query,
  });
}

/**
 * Open/retrieve specific nodes
 */
export async function openNodes(names: string[]): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'open_nodes', {
    names,
  });
}

/**
 * Read the entire graph
 */
export async function readGraph(): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'read_graph', {});
}

/**
 * Delete entities
 */
export async function deleteEntities(names: string[]): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'delete_entities', {
    names,
  });
}

/**
 * Delete relations
 */
export async function deleteRelations(relations: Relation[]): Promise<unknown> {
  return callMCPTool(SERVER_NAME, 'delete_relations', {
    relations,
  });
}
