export interface ProductionLine {
  id: number;
  organisation_id: number;
  work_center_id: number;
  name: string;
  status: string;
  description: string;
  created_at: string;
  updated_at: string;
  work_center: Workcenter;
}

interface Workcenter {
  id: number;
  organisation_id: number;
  name: string;
  description: string;
  location: string;
  capacity_per_day_uom: string;
  capacity_per_day: string;
  created_at: string;
  updated_at: string;
}
