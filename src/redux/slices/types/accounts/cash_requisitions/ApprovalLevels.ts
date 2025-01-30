export interface ApprovalLevel {
  id: number;
  name: string;
  level: number;
  organisation_id: number;
  branch_id: number;
  status_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  user_id?: number;
}
