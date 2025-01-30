export interface GoodReceivedNote {
  id: number;
  grn_no: string;
  organisation_id: number;
  purchase_order_id: number;
  receipt_date: string;
  received_by: number;
  truck_id: number;
  driver_id: null;
  delivery_note_number: string;
  attachment: null;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  inspected_by: string;
  remarks: null;
  grn_items: Grnitem[];
  purchase_order: Purchaseorder;
  trucks: null;
  driver: null;
}

interface Purchaseorder {
  id: number;
  purchase_order_no: string;
  organisation_id: number;
  bid_id: null;
  supplier_id: number;
  issue_date: string;
  develivery_date: string;
  total_amount: string;
  currency_id: number;
  status: string;
  notes: null;
  deleted_at: null;
  supplier: Supplier;
  purchase_order_items: Purchaseorderitem[];
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

interface Grnitem {
  id: number;
  grn_id: number;
  item_id: number;
  received_quantity: number;
  inspection_status: string;
  inspected_by: null;
  remarks: string;
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
