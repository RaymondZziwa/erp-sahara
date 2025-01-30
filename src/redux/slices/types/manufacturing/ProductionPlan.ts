export interface ProductionPlan {
  id: number;
  organisation_id: number;
  item_id: number;
  planned_start_date: Date;
  planned_end_date: Date;
  quantity: string;
  status: string;
  description: null;
  created_at: string;
  updated_at: string;
  production_schedules: Schedule[];
}
interface Schedule {
  work_order_id: number;
  machine_id: number;
  start_time: string;
  end_time: string;
  description: string;
}
