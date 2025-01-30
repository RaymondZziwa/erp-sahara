export interface Drug {
  id: number;
  name: string;
  condition_id: number;
  description: null;
  created_at: null;
  updated_at: null;
  deleted_at: null;
  condition: Condition;
}

interface Condition {
  id: number;
  name: string;
  condition_id: null;
  created_at: null;
  updated_at: null;
  deleted_at: null;
}
