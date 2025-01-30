export interface Driver {
  id: number;
  organisation_id: number;
  staff_id: number;
  license_number: string;
  status: number;
  created_at: string;
  updated_at: string;
  goods_dispatched_notes: any[];
}
