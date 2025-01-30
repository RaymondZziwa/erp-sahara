export interface Designation {
  id: number;
  organisation_id: number;
  department_id: number;
  designation_name: string;
  description: string;
  created_at: string;
  updated_at: string;
  department: Department;
  employees: any[];
}

interface Department {
  id: number;
  organisation_id: number;
  department_name: string;
  description: string;
  created_at: string;
  updated_at: string;
}
