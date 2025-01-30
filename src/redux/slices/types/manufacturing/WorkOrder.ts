export interface WorkOrder {
  id: number;
  organisation_id: number;
  order_number: string;
  production_line_id: number;
  quantity: string;
  actual_start_date: Date;
  item_id: number;
  actual_end_date: Date;
  planned_start_date: Date;
  planned_end_date: Date;
  status: string;
  created_at: string;
  updated_at: string;
}
