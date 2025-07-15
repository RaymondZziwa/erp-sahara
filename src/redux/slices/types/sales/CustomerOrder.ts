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

export interface Customer {
  organization_name: string;
  first_name: string;
  last_name: string;
  other_name: string;
  phone: string;
  email: string;
  industry: string;
  headquarters_address: string;
  organization_type: 'Corporation' | 'Partnership' | 'LLC' | 'Sole Proprietorship';
  salutation?: 'Mr' | 'Mrs' | 'Ms' | 'Miss' | 'Dr' | 'Prof' | 'Rev' | null; // Nullable
  status: 'active' | 'inactive' | 'suspended';
  billing_address: string;
  shipping_address: string;
  credit_limit: string; // Consider changing to number if it's numeric
  payment_terms: 'DOR' | 'Net7' | 'Net30' | 'Net60' | 'Net90' | 'Prepaid' | 'COD' | 'CIA' | 'EOM' | 'Custom';
  bank_details: number; // Assuming this is an ID reference
  tax_identification_number: string;
  description: string;
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
