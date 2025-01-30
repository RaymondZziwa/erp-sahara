import { Budget } from "../../budgets/Budget";
import { Department } from "../../hr/Departments";
import { Project } from "../../projects/Project";

export interface CashRequisition {
  id: number;
  organisation_id: number;
  requisition_no: string;
  requester_id: number;
  title: string;
  total_amount: string;
  approved_total_amount: string;
  currency_id: number;
  purpose: string;
  status: string;
  current_approval_level: number;
  date_expected: string;
  created_by: number;
  branch_id: number;
  segment_id: number;
  department_id: number;
  budget_id: null | string;
  project_id: number;
  requisition_unique_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
  cash_requisition_items: Cashrequisitionitem[];
  requisition_approval_level: null;
  budget: Budget | null;
  project: Project | null;
  segment: null;
  department: null | Department;
}

export interface Cashrequisitionitem {
  id: number;
  cash_requisition_id: number;
  budget_item_id: null;
  item_id: number;
  item_name: string;
  unit_cost: string;
  quantity: string;
  total_price: string;
  approved_amount: string | null;
  approval_status: string;
  current_approval_level: number;
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
