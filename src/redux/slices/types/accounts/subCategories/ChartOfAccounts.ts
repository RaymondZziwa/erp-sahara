export interface ChartOfAccountDetailsOld {
  data: Data;
  ledger_total: number;
}

interface Data {
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
  journal_line_transactions: Journallinetransaction[];
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
  cash_flow_type: null;
  manual_entry: string;
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

export interface ChartOfAccountDetails {
  id: number;
  name: string;
  code: string;
  description: string;
  organisation_id: number;
  branch_id: null;
  account_sub_category_id: number;
  cash_flow_type: null;
  is_contra: string;
  manual_entry: string;
  deleted_at: null;
  journal_line_transactions: any[];
}
