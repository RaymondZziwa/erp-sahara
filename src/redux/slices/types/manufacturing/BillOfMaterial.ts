export interface BillOfMaterial {
  id: number;
  item_id: string;
  version: string;
  created_at: string;
  updated_at: string;
  item: Item;
  bom_items: Boitem[];
}

interface Boitem {
  item_id: number;
  quantity: string;
  uom_id: string;
  notes: string;
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
