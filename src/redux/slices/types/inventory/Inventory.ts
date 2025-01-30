export interface Inventory {
  id: number;
  organisation_id: number;
  item_id: number;
  supplier_id: null;
  ref_id: string;
  type: string;
  warehouse_id: number;
  received_date: string;
  quantity: number;
  damaged_quantity: number;
  reorder_level: number;
  on_backorder: number;
  expiry_date: null;
  reason_for_damage: null;
  created_at: string;
  updated_at: string;
  item: Item;
  supplier: null;
  warehouse: Warehouse;
}

interface Warehouse {
  id: number;
  organisation_id: number;
  name: string;
  location: string;
  longtitude: null;
  latitude: null;
}

interface Item {
  id: number;
  item_category_id: number;
  organisation_id: number;
  unit_of_measure_id: number;
  currency_id: number;
  brand_id: null;
  name: string;
  chart_of_account_id: number;
  item_type: string;
  cost_price: string;
  selling_price: string;
  vat: string;
  reference: string;
  barcode: null;
  stock_alert_level: string;
  sku_unit: string;
  has_expiry: number;
  shell_life: string;
  description: string;
  item_category: Itemcategory;
  currency: Currency;
}

interface Currency {
  id: number;
  organisation_id: number;
  name: string;
  code: string;
  is_base_currency: number;
  deleted_at: null;
  created_at: string;
  updated_at: string;
}

interface Itemcategory {
  id: number;
  organisation_id: number;
  name: string;
  parent_id: null;
  description: null;
}
