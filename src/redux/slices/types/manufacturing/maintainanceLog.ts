export interface MaintainanceLog {
  id: number;
  equipment_id: number;
  maintenance_type: "preventive" | "corrective" | "predictive";
  scheduled_date: Date | null;
  completed_date: Date | null;
  technician_id: string;
  description: string;
  actions_taken: string;
  created_at: string;
  updated_at: string;
}

interface Equipment {
  id: number;
  organisation_id: number;
  name: string;
  work_center_id: number;
  maintenance_every_after: number;
  maintenance_period: string;
  status: string;
  created_at: string;
  updated_at: string;
}
