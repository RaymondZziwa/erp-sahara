import { Department } from "./Departments";
import { Designation } from "./Designation";
import { SalaryStructure } from "./SalaryStructure";

export interface Employee {
  id: number;
  department_id: number;
  department: Department;
  salary_structure_id: number;
  salary_structure: SalaryStructure;
  designation_id: number;
  designation: Designation;
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
