export interface Team {
  id: number;
  uuid?: string;
  name: string;
  description?: string;
  personal_team: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role?: string;
  created_at?: string;
}

export interface Project {
  uuid: string;
  name: string;
  description?: string;
  team_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
}
