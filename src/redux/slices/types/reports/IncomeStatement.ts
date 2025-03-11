export interface IncomeStatement {
  sub_category_id: number;
  sub_category_name: string;
  total: number;
  ledgers: ledger[];
  data: [];
}

interface ledger {
  ledger_id: number;
  ledger_name: string;
  ledger_code: string;
  amount: number;
}
