export interface Budget {
  id: number;
  organisation_id: number;
  name: string;
  allocated_amount: string;
  spent_amount: string;
  remaining_amount: string;
  currency_id: number;
  description: string | undefined;
  parent_id: null;
  fiscal_year_id: number;
  project_id: null;
  activity_id: null;
  segment_id: null;
  deleted_at: null;
  created_at: string;
  updated_at: string;
  totalRevenue: number;
  totalExpense: string;
  netIncome: number;
  netCashFlow: number;
  items: Item[];
  fiscal_year: Fiscalyear;
}

interface Fiscalyear {
  id: number;
  financial_year: string;
  start_date: string;
  end_date: string;
  organisation_id: number;
  status: number;
  remaining_days: number;
  should_alert: boolean;
}

interface Item {
  id: number;
  name: string;
  type: string;
  amount: string;
  currency_rate: string;
  amount_in_base_currency: string;
  chart_of_account_id: number;
  budget_id: number;
  status: number;
  deleted_at: null;
  created_at: string;
  updated_at: string;
  chart_of_account: Chartofaccount;
}

interface Chartofaccount {
  id: number;
  name: string;
  code: string;
  description: string;
  organisation_id: number;
  branch_id: null;
  account_sub_category_id: number;
  cash_flow_report_category_id: null;
  manual_entry: string;
  opening_balance: string;
  deleted_at: null;
  account_sub_category: Accountsubcategory;
}

interface Accountsubcategory {
  id: number;
  name: string;
  description: string;
  code: number;
  organisation_id: null;
  account_category_id: number;
  is_system_created: number;
  parent_id: number;
  deleted_at: null;
  account_category: Accountcategory;
}

interface Accountcategory {
  id: number;
  name: string;
  code: string;
  normal_balance_side: number;
  deleted_at: null;
  created_at: string;
  updated_at: string;
}
