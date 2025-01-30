export interface CenterDownTimeLog {
  id: number;
  work_center_id: number;
  downtime_reason: string;
  start_time: Date | null;
  end_time: Date | null;
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
