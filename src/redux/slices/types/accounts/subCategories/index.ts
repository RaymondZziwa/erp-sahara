export interface AccountSubCategory {
  sub_parent_id: number;
  id: number;
  name: string;
  description: string;
  code: number;
  organisation_id: null;
  account_category_id: number;
  is_system_created: number;
  parent_id: null | number;
  deleted_at: null;
  chart_of_accounts: Chartofaccount[];
  parent: Parent | null;
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
  children: Child[];
}

interface Parent {
  id: number;
  name: string;
  description: string;
  code: number;
  organisation_id: null;
  account_category_id: number;
  is_system_created: number;
  parent_id: null;
  deleted_at: null;
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
}
