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

export interface ProductionOutput {
  id: string; // optional if you want to edit/delete
  production_schedule_id: string;
  item_id: string;
  quantity: number;
  produced_at: string; // ISO format: "2025-06-22"
  output_type: "Final" | "Intermediate"; // optional enum
  warehouse_id: string;
  uom: string;

  // Optional: nested display data
  production_schedule?: {
    id: string;
    name: string;
  };
  item?: {
    id: string;
    name: string;
  };
  warehouse?: {
    id: string;
    name: string;
  };
  uom_details?: {
    id: string;
    name: string;
  };
}
