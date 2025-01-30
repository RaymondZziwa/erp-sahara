export interface CapapcityLog {
  id: number;
  work_center_id: number;
  log_date: Date | null;
  utilized_capacity: string;
  available_capacity: string;
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
