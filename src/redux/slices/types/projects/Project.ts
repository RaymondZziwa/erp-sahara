export interface Project {
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
  project_partners: Projectpartner[];
  project_category: Projectcategory;
  sector: Sector;
  contracts: any[];
  project_files: any[];
  project_comments: any[];
}

interface Sector {
  id: number;
  organisation_id: number;
  sector_name: string;
  description: string;
}

interface Projectcategory {
  id: number;
  organisation_id: number;
  name: string;
  description: string;
}

interface Projectpartner {
  id: number;
  project_id: number;
  partner_id: number;
  type: string;
  role: string;
  partner: Partner;
}

interface Partner {
  id: number;
  organisation_id: number;
  partner_name: string;
  contact_person: string;
  contact_person_email: string;
  contact_person_phone: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  description: string;
}
