export interface RequestForQuotation {
  id: number;
  organisation_id: number;
  purchase_request_id: null | number;
  title: string;
  description: null;
  submission_deadline: string;
  budget: string;
  currency_id: number;
  deleted_at: null;
  rfq_items: Rfqitem[];
  bids: Bid[];
  purchase_request: null;
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
  bid_document: null;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
  bid_items: Biditem[];
  supplier: Supplier;
}

interface Supplier {
  id: number;
  organisation_id: number;
  name: string;
  email: string;
  telephone: string;
  location: string;
  balance: string;
}

interface Biditem {
  id: number;
  bid_id: number;
  request_for_quotation_item_id: number;
  item_id: number;
  unit_price: string;
  quantity: string;
  total_price: string;
  currency_id: number;
  delivery_time: number;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  request_for_quotation_item: Rfqitem;
}

interface Rfqitem {
  id: number;
  request_for_quotation_id: number;
  item_id: number;
  quantity: string;
  specifications: string;
  deleted_at: null;
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
  reference: null;
  barcode: null;
  stock_alert_level: string;
  sku_unit: string;
  has_expiry: number;
  shell_life: string;
  description: null;
  item_category: Itemcategory;
}

interface Itemcategory {
  id: number;
  organisation_id: number;
  name: string;
  description: null;
}
