export interface WorkOrder {
  id: number;
  organisation_id: number;

  item_id: string; // UUID
  customer_id: string; // UUID
  quantity: number;

  start_date: Date;
  expected_completion_date: Date;

  priority: "low" | "medium" | "high" | "urgent";
  status: "planned" | "released" | "in-progress" | "completed" | "cancelled";

  created_at: string;
  updated_at: string;
}
