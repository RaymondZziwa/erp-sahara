import { Supplier } from "../inventory/Suppliers";
import { Warehouse } from "../inventory/Warehouse";
import { Item } from "../procurement/Items";
import { UnitOfMeasurement } from "../procurement/units";

export interface SupplierDelivery {
    supplier_id: string;       // UUID of the supplier
    item_id: string;           // UUID of the delivered item
    delivery_date: string;     // Date in YYYY-MM-DD format
    quantity: number;          // Quantity delivered
    uom_id: string;            // UUID of unit of measurement
    warehouse_id: string;      // UUID of the receiving warehouse
    notes?: string;            // Optional notes
}

export interface Delivery {
  id: string;
  organisation_id: string;
  supplier_id: string;
  supplier: Supplier;
  item_id: string;
  item: Item;
  warehouse_id: string;
  warehouse: Warehouse;
  delivery_date: string; // ISO date string
  quantity: string;
  uom_id: string;
  uom: UnitOfMeasurement;
  status: string;
  final_purchase_price: string;
  notes: string;
  unique_id: string;
  date_paid: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Settlement {
  id: string;
  organisation_id: string;
  delivery_id: string;
  good_beans_kg: string;
  defects_kg: string;
  moisture_kg: string;
  moisture_penalty_applied: number;
  preparation_cost: string;
  moisture_cost: string;
  defect_cost: string;
  good_beans_cost: string;
  total_payable: string;
  date_paid: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  delivery: Delivery;
}
