export interface PurchaseOrder {
  id: number;
  purchase_order_no: string;
  organisation_id: number;
  bid_id: null | number;
  supplier_id: number;
  issue_date: string;
  develivery_date: string;
  total_amount: string;
  currency_id: number;
  status: string;
  notes: null;
  deleted_at: null;
  purchase_order_items: Purchaseorderitem[];
  bid: Bid | null;
  supplier: Supplier;
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

interface Supplier {
  id: number;
  organisation_id: number;
  supplier_name: string;
  address: string;
  email: string;
  contact_person: string;
  contact_person_title: string;
  phone_number: string;
  company_registration_number: string;
  tax_identification_number: string;
  credit_limit: string;
  supplier_type: string;
  status: string;
  notes: string;
}

interface Bid {
  id: number;
  bid_no: string;
  request_for_quotation_id: number;
  supplier_id: number;
  submmitted_at: string;
  total_cost: string;
  currency_id: string;
  submission_deadline: string;
  delivery_time: number;
  bid_document: null | string;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  bid_items: Biditem[];
}

interface Biditem {
  id: number;
  bid_id: number;
  request_for_quotation_item_id: number;
  unit_price: string;
  quantity: string;
  total_price: string;
  currency_id: number;
  delivery_time: number;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  request_for_quotation_item: Requestforquotationitem;
}

interface Requestforquotationitem {
  id: number;
  request_for_quotation_id: number;
  item_id: number;
  quantity: string;
  specifications: string;
  deleted_at: null;
  item: Item;
}

interface Purchaseorderitem {
  id: number;
  purchase_order_id: number;
  item_id: number;
  quantity: number;
  unit_price: string;
  total_price: string;
  currency_id: number;
  delivery_status: string;
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
  chart_of_account_id: number;
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
