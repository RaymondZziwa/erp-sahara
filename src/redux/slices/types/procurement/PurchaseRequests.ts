import { Currency } from "./Currency";

export interface PurchaseRequest {
  request_no: any;
  id: number;
  purchase_request_no: string;
  organisation_id: number;
  name: string;
  request_date: string;
  status: string;
  requested_by: number;
  request_comment: string;
  reviewed_by: null | number;
  reviewer_comment: null | string;
  review_date: null | string;
  approved_by: null | number;
  approval_comment: null | string;
  approval_date: null | string;
  rejected_by: null;
  rejected_comment: null | string;
  rejected_date: null | string;
  tc: null | string;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
  purchase_request_items: Purchaserequestitem[];
  purchase_request_approved_items: Purchaserequestapproveditem[];
  currency: Currency | null;
  title: string;
}

interface Purchaserequestapproveditem {
  id: number;
  purchase_request_id: number;
  item_id: number;
  approved_quantity: number;
  unit_price_estimate: string;
  total_price_estimate: string;
  currency_id: number;
  created_at: string;
  updated_at: string;
  item: Item | null;
}

interface Purchaserequestitem {
  budget_item_id: number;
  specifications: string;
  currency: string;
  cost_estimate: number;
  purpose: any;
  specification: string;
  id: number;
  purchase_request_id: number;
  item_id: number;
  quantity: string;
  unit_price_estimate: string;
  total_price_estimate: string;
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
