export interface Asset {
  id: number,
  name: string;
  asset_type: string;
  supplier?: string; // Nullable
  asset_account_id: number;
  asset_category_id: number;
  identity_no: string;
  purchase_date: string;
  date_put_to_use: string;
  purchase_cost: number;
  current_value: number;
  date_when: string;
  depreciation_account_id: number;
  depreciation_loss_account_id: number;
  depreciation_gain_account_id: number;
  expense_account_id: number;
  depreciation_method: "straight_line" | "declining_balance";
  depreciation_rate: number;
  income_account_id: number;
  appreciation_account_id: number;
  appreciation_loss_account_id: number;
  appreciation_gain_account_id: number;
  appreciation_rate?: number; // Nullable
  salvage_value: number;
  useful_life: number;
  description: string;
  status: string; 
}

export interface AssetCategory {
    id: number,
    name: string,
    description: string,
    updated_at: string,
    created_at: string
}