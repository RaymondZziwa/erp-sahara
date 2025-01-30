export interface GeneralLedgerResponse {
  summaries: Ledger[];
  total_credit: number;
  total_debit: number;
}

export interface Ledger {
  id: number;
  debit_sum: string;
  credit_sum: string;
  chart_of_account_id: number;
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
  cash_flow_type: null | string;
  manual_entry: string;
  deleted_at: null;
}
