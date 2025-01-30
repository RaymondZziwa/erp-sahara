export interface Deduction {
  id: number;
  organisation_id: number;
  employee_id: number;
  deduction_type_id: number;
  amount: string;
  frequency: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  employee: Employee;
  deduction_type: DeductionType;
}

interface DeductionType {
  id: number;
  organisation_id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface Employee {
  id: number;
  organisation_id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string;
  marital_status: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  hire_date: string;
  tax_identification_number: null;
  department_id: number;
  designation_id: number;
  salary_structure_id: null;
  supervisor_id: null;
  status: string;
  created_at: string;
  updated_at: string;
}
