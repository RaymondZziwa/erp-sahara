export interface MaintainanceLog {
  id: number;
  equipment_id: number;
  maintenance_date: Date | null;
  maintenance_end_date: Date | null;
  performed_by: number;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  equipment: Equipment;
  available_capacity?: string;
  mantenance_every_after: number;
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
