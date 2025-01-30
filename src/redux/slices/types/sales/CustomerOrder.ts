export interface CustomerOrder {
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
  quotation: Quotation;
  currency: Currency;
  customer: Customer;
}

interface Customer {
  id: number;
  organisation_id: number;
  organization_name: string;
  email: string;
  organization_type: string;
  industry: string;
  primary_contact_person: string;
  contact_person_title: string;
  phone_number: string;
  headquarters_address: string;
  billing_address: string;
  shipping_address: string;
  payment_terms: string;
  credit_limit: string;
  status: string;
  bank_details: string;
  tax_identification_number: string;
  created_at: string;
  updated_at: string;
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
  notes: null | string;
  created_at: string;
  updated_at: string;
  item: Item;
}

export interface Customerorderitem {
  id: number;
  customer_order_id: number;
  item_id: number;
  quantity: number;
  unit_price: string;
  total_price: string;
  currency_id: number;
  notes: null | string;
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
}

interface Itemcategory {
  id: number;
  organisation_id: number;
  name: string;
  parent_id: null;
  description: null;
}
