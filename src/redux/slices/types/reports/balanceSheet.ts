export interface balanceSheetType {
  assets: assetsElements[];
  equity: assetsElements[];
  liabilities: assetsElements[];
  current_profit_or_loss: number;
  total_assets: number;
  total_liabilities_equity: number;
}

interface assetsElements {
  subcategory_name: string;
  accounts: accountsElements[];
  subcategory_total: number;
}

interface accountsElements {
  account_id: string;
  account_name: string;
  account_code: string;
  balance: number;
}
