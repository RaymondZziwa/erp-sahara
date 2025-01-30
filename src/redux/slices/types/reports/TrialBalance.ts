export interface TrialBalance {
  trial_balance: Balance[];
  financial_year: Financialyear;
}

interface Financialyear {
  id: number;
  financial_year: string;
  start_date: string;
  end_date: string;
  organisation_id: number;
  status: number;
  remaining_days: number;
  should_alert: boolean;
}

interface Balance {
  account_id: number;
  account_name: string;
  account_code: string;
  total_credit: string;
  total_debit: string;
}
