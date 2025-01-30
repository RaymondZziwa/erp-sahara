export interface BillOfMaterial {
  id: number;
  organisation_id: number;
  branch_id: null;
  item_id: number;
  version: string;
  created_at: string;
  updated_at: string;
  item: Item;
  bo_items: Boitem[];
}

interface Boitem {
  id: number;
  bill_of_material_id: number;
  raw_material_id: number;
  quantity: string;
  unit_of_measurement: string;
  created_at: string;
  updated_at: string;
  item: Item;
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
}
