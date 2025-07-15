export interface QuotationItem {
  item_type: 'item' | 'service' | 'custom'; // Must match the parent q_type
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number; // In percentage, e.g., 5 = 5%
  item_sku: string;
  warehouse_location: string;
  sort_order: number;
  // Optional fields (commented in your example)
  item_id?: string;
  uom?: string; // Unit of Measure ID (optional)
}

export interface Quotation {
  q_type: 'item' | 'service' | 'custom';
  customer_id: string;
  opportunity_id?: string | null; // Nullable
  issue_date: string; // ISO format: YYYY-MM-DD
  expiry_date: string;
  notes: string;
  status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'; // Nullable
  items: QuotationItem[];
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

interface Lead {
  id: number;
  organisation_id: number;
  name: string;
  email: string;
  phone: string;
  notes: string;
  status: string;
  created_at: string;
  updated_at: string;
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
  item_category: Itemcategory;
}

interface Itemcategory {
  id: number;
  organisation_id: number;
  name: string;
  parent_id: null;
  description: null;
}
