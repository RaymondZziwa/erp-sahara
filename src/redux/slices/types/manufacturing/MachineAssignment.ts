export interface MachineAssignment {
  machine_id: number;
  production_line_id: number;
  assigned_at: string;
  updated_at: string;
  created_at: string;
  released_at: Date | null;
  id: number;
}
