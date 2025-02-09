export interface StockMovement {
  id: number;
  organisation_id: number;
  item_id: string | null;
  supplier_id: null;
  ref_id: string;
  warehouse_id: number;
  received_date: string;
  quantity: string;
  damaged_quantity: number;
  reorder_level: number;
  on_backorder: number;
  expiry_date: null;
  reason_for_damage: null;
  created_at: string;
  updated_at: string;
  type: string;
  movement_date: string;
  from_warehouse_id: string | null;
  to_warehouse_id: string | null;
  picked_by: string;
  remarks: string;
}
