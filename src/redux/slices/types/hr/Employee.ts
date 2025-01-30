export interface Employee {
  id: number;
  department_id: number;
  salary_structure_id: number;
  designation_id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  email: string;
  phone: string;
  gender: string;
  marital_status: string;
  date_of_birth: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  hire_date: string;
  supervisor_id?: number | null;
}
