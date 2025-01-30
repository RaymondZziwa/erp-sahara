export interface ProductionPlanSchedule {
  id: number;
  production_plan_id: number;
  work_order_id: number;
  machine_id: number;
  start_time: string;
  end_time: string;
  description: null;
  created_at: string;
  updated_at: string;
  production_plan: Productionplan;
}

interface Productionplan {
  id: number;
  organisation_id: number;
  item_id: number;
  planned_start_date: string;
  planned_end_date: string;
  quantity: string;
  status: string;
  description: null;
  created_at: string;
  updated_at: string;
}
