export interface Deployment {
  uuid: string;
  application_uuid?: string;
  status: DeploymentStatus;
  commit_sha?: string;
  commit_message?: string;
  deployment_url?: string;
  logs?: string;
  created_at?: string;
  updated_at?: string;
  finished_at?: string;
}

export type DeploymentStatus =
  | 'queued'
  | 'in_progress'
  | 'finished'
  | 'failed'
  | 'cancelled';

export interface ListDeploymentsParams {
  page?: number;
  per_page?: number;
}

export interface TriggerDeploymentDto {
  force_rebuild?: boolean;
}
