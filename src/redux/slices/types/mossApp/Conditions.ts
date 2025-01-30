export interface Condition {
  id: number;
  name: string;
  condition_id: null;
  created_at: null;
  updated_at: null;
  deleted_at: null;
  conditions: SubCondition[];
  parent: null;
}

export interface SubCondition {
  id: number;
  name: string;
  condition_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: null;
}
