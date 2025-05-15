export interface Asset {
  id: number,
  name: string;
  asset_type: string;
  supplier?: string; // Nullable
  asset_account_id: number;
  asset_category_id: number;
  identity_no: string;
  purchase_date: string;
  currency_id: number;
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

export interface AssetIncomeType {
  id: string,
  name: string,
  income_account_id: number,
  description: string
}

export interface AssetAssignment {
  id: string,
  asset_id: string,
  assigned_to: string,
  reason_for_assignment: string,
  start_date: string,
  end_date: string,
  notes: string
}

export interface AssetMaintenance {
  id: string;
  asset_id: string;
  start_date: string; // ISO date string (e.g., '2025-03-01')
  end_date: string;   // ISO date string (e.g., '2025-03-05')
  maintenance_type: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  downtime_days: number;
  description: string;
  cost: number;
  service_provider_id: string; // Should be linked to a searchable list of suppliers
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  checklist?: string[] | null; // Nullable, list of tasks to be performed
}
