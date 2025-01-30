export interface Lead {
  id: number;
  organisation_id: number;
  name: string;
  email: string;
  phone: string;
  notes: string;
  status: string;
  created_at: string;
  updated_at: string;
  quotation: Quotation[];
}

interface Quotation {
  id: number;
  qoutation_no: string;
  title: string;
  organisation_id: number;
  customer_id: number;
  lead_id: number;
  currency_id: number;
  issue_date: string;
  expiry_date: string;
  net_amount: string;
  vat_rate: string;
  total_amount: string;
  notes: null | string;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  quotation_items: Quotationitem[];
}

interface Quotationitem {
  id: number;
  quotation_id: number;
  item_id: number;
  quantity: string;
  unit_price: string;
  total_price: string;
  currency_id: number;
  notes: null;
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
}
