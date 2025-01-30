export interface Variant {
  id: number;
  item_id: number;
  name: string;
  sku: string;
  price: string;
  stock: number;
  attributes: string;
  item: Item;
}

interface Item {
  id: number;
  item_category_id: number;
  organisation_id: number;
  unit_of_measure_id: number;
  currency_id: number;
  account_chart_id: number;
  item_type: string;
  name: string;
  cost_price: string;
  selling_price: string;
  vat: string;
  reference: string;
  barcode: null;
  stock_alert_level: null;
  sku_unit: null;
  has_expiry: number;
  shell_life: null;
  description: null;
  brand_id: null;
}
