import { ChartofAccount } from "./ChartOfAccounts";

export interface Account {
  id: number;
  name: string;
  code: string;
  normal_balance_side: number;
  deleted_at: null;
  created_at: string;
  updated_at: string;
  account_sub_categories: AccountSubCategory[];
}

export interface AccountSubCategory {
  id: number;
  name: string;
  description: string;
  code: number;
  organisation_id: null;
  account_category_id: number;
  is_system_created: number;
  parent_id: null | number;
  deleted_at: null;
  children: Child[];
}

interface Child {
  id: number;
  name: string;
  description: string;
  code: number;
  organisation_id: null;
  account_category_id: number;
  is_system_created: number;
  parent_id: number;
  deleted_at: null;
  children: ChartofAccount[];
}
