export interface ProjectTeamMember {
  id: number;
  project_id: number;
  user_id: number;
  project_role_id: number;
  project: Project;
  project_role: Projectrole;
}

interface Projectrole {
  id: number;
  project_id: number;
  name: string;
  description: string;
}

interface Project {
  id: number;
  organisation_id: number;
  project_category_id: number;
  name: string;
  sector_id: number;
  prioty: string;
  status: string;
  cost: string;
  challenges: null;
  location: string;
  reporting_period: string;
  project_manager: number;
  start_date: string;
  end_date: null;
  recommendations: null;
  deleted_at: null;
}
