export interface ActivityService {
  id: number;
  activity_id: number;
  service_name: string;
  cost: string;
  description: string;
  age_group_id: number;
  activity: Activity;
}

interface Activity {
  id: number;
  project_id: number;
  name: string;
  objectives: null;
  activity_methodology: string;
  description: string;
  cost: string;
  currency_id: number;
  prioty: string;
  status: string;
  start_date: string;
  end_date: string;
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
