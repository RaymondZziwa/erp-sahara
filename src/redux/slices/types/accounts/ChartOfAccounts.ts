export interface ChartofAccount {
  id: number;
  name: string;
  code: string;
  description: string;
  organisation_id: number;
  branch_id: null;
  account_sub_category_id: number;
  cash_flow_type: null;
  manual_entry: string;
  deleted_at: null;
  account_sub_category: Accountsubcategory;
  balance: Balance | null;
  journal_line_transaction: Journallinetransaction[];
}

interface Journallinetransaction {
  id: number;
  journal_transaction_id: number;
  chart_of_account_id: number;
  debit_amount: string;
  credit_amount: string;
  base_currency_amount: string;
  currency_rate: string;
  currency_id: number;
  base_currency_id: number;
  deleted_at: null;
  created_at: string;
  updated_at: string;
}

interface Balance {
  id: number;
  chart_of_account_id: number;
  fiscal_year_id: number;
  debit_sum: string;
  credit_sum: string;
  base_currency_amount: string;
  currency_rate: string;
  currency_id: number;
  base_currency_id: number;
  budget_id: null;
  project_id: null;
  segment_id: null;
  transaction_date: string;
  deleted_at: null;
  created_at: string;
  updated_at: string;
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
