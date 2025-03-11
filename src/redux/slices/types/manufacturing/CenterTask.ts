export interface CenterTask {
  id: number;
  work_center_id: number;
  work_order_id: number;
  task_name: string;
  planned_start_time: Date | null;
  planned_end_time: Date | null;
  status: string;
  created_at: string;
  updated_at: string;
  work_center: Workcenter;
  employee_id: number;
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
