export interface Equipment {
  id: number;
  organisation_id: number;
  name: string;
  work_center_id: number;
  maintenance_every_after: number;
  maintenance_period: string;
  status: string;
  created_at: string;
  updated_at: string;
}
