export interface ProjectRole {
  id: number;
  project_id: number;
  name: string;
  description: string;
  project: Project;
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
