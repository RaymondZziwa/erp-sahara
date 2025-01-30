export interface ProductionPlanMaterial {
  id: number;
  production_plan_id: number;
  material_required_date: string;
  item_id: number;
  quantity: string;
  material_cost: string;
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
