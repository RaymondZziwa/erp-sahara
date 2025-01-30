export interface DistributionOrder {
  id: number;
  organisation_id: number;
  customer_order_id: number;
  warehouse_id: number;
  status: string;
  shipping_date: string;
  notes: string;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  customer_order: Customerorder;
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

interface Customerorder {
  id: number;
  customer_order_no: string;
  organisation_id: number;
  customer_id: number;
  quotation_id: number;
  total_amount: string;
  currency_id: number;
  order_date: string;
  status: string;
  expected_delivery_date: string;
  shipping_address: string;
  shipping_method: null;
  tracking_number: null;
  order_note: null;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  customer_order_items: Customerorderitem[];
  currency: Currency;
}

interface Customerorderitem {
  id: number;
  customer_order_id: number;
  item_id: number;
  quantity: number;
  unit_price: string;
  total_price: string;
  currency_id: number;
  notes: null;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  item: Item;
}

interface Item {
  id: number;
  item_category_id: number;
  organisation_id: number;
  unit_of_measure_id: number;
  currency_id: number;
  brand_id: null;
  account_chart_id: number;
  item_type: string;
  name: string;
  cost_price: string;
  selling_price: string;
  vat: string;
  reference: string;
  barcode: string;
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
