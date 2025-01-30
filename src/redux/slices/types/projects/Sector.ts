export interface Sector {
  id: number;
  organisation_id: number;
  sector_name: string;
  description: string;
  projects: Project[];
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
  recommendations: string;
  deleted_at: null;
}
