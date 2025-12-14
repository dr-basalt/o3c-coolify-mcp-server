import { z } from 'zod';

// Validation Schemas
export const GetCurrentTeamSchema = z.object({});

export const ListTeamsSchema = z.object({});

export const GetTeamSchema = z.object({
  team_id: z.number().int().positive(),
});

export const GetTeamMembersSchema = z.object({
  team_id: z.number().int().positive(),
});

// Project schemas
export const ListProjectsSchema = z.object({});

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
});

export const GetProjectSchema = z.object({
  uuid: z.string().uuid(),
});

export const UpdateProjectSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
});

export const DeleteProjectSchema = z.object({
  uuid: z.string().uuid(),
});

// Tool Definitions
export const TeamTools = [
  {
    name: 'coolify_get_current_team',
    description: 'Get information about the current team based on API token',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'coolify_list_teams',
    description: 'List all teams the current user has access to',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'coolify_get_team',
    description: 'Get detailed information about a specific team',
    inputSchema: {
      type: 'object' as const,
      properties: {
        team_id: { type: 'number', description: 'Team ID' },
      },
      required: ['team_id'],
    },
  },
  {
    name: 'coolify_get_team_members',
    description: 'Get all members of a specific team',
    inputSchema: {
      type: 'object' as const,
      properties: {
        team_id: { type: 'number', description: 'Team ID' },
      },
      required: ['team_id'],
    },
  },
  // Project tools
  {
    name: 'coolify_list_projects',
    description: 'List all projects in the current team',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'coolify_create_project',
    description: 'Create a new project',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Project name' },
        description: { type: 'string', description: 'Project description' },
      },
      required: ['name'],
    },
  },
  {
    name: 'coolify_get_project',
    description: 'Get detailed information about a specific project',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Project UUID' },
      },
      required: ['uuid'],
    },
  },
  {
    name: 'coolify_update_project',
    description: 'Update an existing project',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Project UUID' },
        name: { type: 'string', description: 'New project name' },
        description: { type: 'string', description: 'Project description' },
      },
      required: ['uuid'],
    },
  },
  {
    name: 'coolify_delete_project',
    description: 'Delete a project',
    inputSchema: {
      type: 'object' as const,
      properties: {
        uuid: { type: 'string', description: 'Project UUID' },
      },
      required: ['uuid'],
    },
  },
];

// System tools
export const SystemTools = [
  {
    name: 'coolify_get_version',
    description: 'Get the Coolify API version',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'coolify_health_check',
    description: 'Check the health status of the Coolify API',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
];

// Export validation schemas
export const TeamSchemas = {
  getCurrent: GetCurrentTeamSchema,
  list: ListTeamsSchema,
  get: GetTeamSchema,
  getMembers: GetTeamMembersSchema,
};

export const ProjectSchemas = {
  list: ListProjectsSchema,
  create: CreateProjectSchema,
  get: GetProjectSchema,
  update: UpdateProjectSchema,
  delete: DeleteProjectSchema,
};
