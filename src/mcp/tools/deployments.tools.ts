import { z } from 'zod';

// Validation Schemas
export const ListDeploymentsSchema = z.object({
  page: z.number().min(1).optional(),
  per_page: z.number().min(1).max(100).optional(),
});

export const ListDeploymentsByApplicationSchema = z.object({
  application_uuid: z.string().uuid(),
});

export const GetDeploymentSchema = z.object({
  uuid: z.string().uuid(),
});

// Tool Definitions
export const DeploymentTools = [
  {
    name: 'coolify_list_deployments',
    description: 'List all deployments with optional pagination',
    inputSchema: {
      type: 'object' as const,
      properties: {
        page: { type: 'number', description: 'Page number (default: 1)' },
        per_page: {
          type: 'number',
          description: 'Items per page (default: 20, max: 100)',
        },
      },
    },
  },
  {
    name: 'coolify_list_deployments_by_application',
    description: 'List all deployments for a specific application',
    inputSchema: {
      type: 'object' as const,
      properties: {
        application_uuid: {
          type: 'string',
          description: 'Application UUID',
        },
      },
      required: ['application_uuid'],
    },
  },
  {
    name: 'coolify_get_deployment',
    description:
      'Get detailed information about a specific deployment including logs',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Deployment UUID' },
      },
      required: ['uuid'],
    },
  },
];

// Export validation schemas
export const DeploymentSchemas = {
  list: ListDeploymentsSchema,
  listByApplication: ListDeploymentsByApplicationSchema,
  get: GetDeploymentSchema,
};
