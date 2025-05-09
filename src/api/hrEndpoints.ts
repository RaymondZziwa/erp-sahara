export const HUMAN_RESOURCE_ENDPOINTS = {
  DEPARTMENTS: {
    GET_ALL: "/hr/departments",
    GET_BY_ID: (id: string) => `/hr/departments/${id}`,
    ADD: "/hr/departments/create",
    UPDATE: (id: string) => `/hr/departments/${id}/update`,
    DELETE: (id: string) => `/hr/departments/${id}/delete`,
  },
  DESIGNATIONS: {
    GET_ALL: "/hr/designations",
    GET_BY_ID: (id: string) => `/hr/designations/${id}`,
    ADD: "/hr/designations/create",
    UPDATE: (id: string) => `/hr/designations/${id}/update`,
    DELETE: (id: string) => `/hr/designations/${id}/delete`,
  },
  SALARY_STRUCTURES: {
    GET_ALL: "/hr/salarystructure",
    GET_BY_ID: (id: string) => `/hr/salarystructure/${id}`,
    ADD: "/hr/salarystructure/create",
    UPDATE: (id: string) => `/hr/salarystructure/${id}/update`,
    DELETE: (id: string) => `/hr/salarystructure/${id}/delete`,
  },
  EMPLOYEES: {
    GET_ALL: "/hr/employees",
    GET_BY_ID: (id: string) => `/hr/employees/${id}`,
    ADD: "/hr/employees/create",
    UPDATE: (id: string) => `/hr/employees/${id}/update`,
    DELETE: (id: string) => `/hr/employees/${id}/delete`,
  },
  ATTENDENCIES: {
    GET_ALL: "/hr/attendance",
    GET_BY_ID: (id: string) => `/hr/attendance/${id}`,
    ADD: "/hr/attendance/create",
    UPDATE: (id: string) => `/hr/attendance/${id}/update`,
    DELETE: (id: string) => `/hr/attendance/${id}/delete`,
  },
  LEAVE_TYPES: {
    GET_ALL: "/hr/leavetypes",
    GET_BY_ID: (id: string) => `/hr/leavetypes/${id}`,
    ADD: "/hr/leavetypes/create",
    UPDATE: (id: string) => `/hr/leavetypes/${id}/update`,
    DELETE: (id: string) => `/hr/leavetypes/${id}/delete`,
  },
  LEAVE_APPLICATIONS: {
    GET_ALL: "/hr/leaveapplications",
    GET_BY_ID: (id: string) => `/hr/leaveapplications/${id}`,
    ADD: "/hr/leaveapplications/create",
    UPDATE: (id: string) => `/hr/leaveapplications/${id}/update`,
    DELETE: (id: string) => `/hr/leaveapplications/${id}/delete`,
  },
  BONUS_TYPES: {
    GET_ALL: "/hr/bonustypes",
    GET_BY_ID: (id: string) => `/hr/bonustypes/${id}`,
    ADD: "/hr/bonustypes/create",
    UPDATE: (id: string) => `/hr/bonustypes/${id}/update`,
    DELETE: (id: string) => `/hr/bonustypes/${id}/delete`,
  },
  LOAN_TYPES: {
    GET_ALL: "/hr/loantypes",
    GET_BY_ID: (id: string) => `/hr/loantypes/${id}`,
    ADD: "/hr/loantypes/create",
    UPDATE: (id: string) => `/hr/loantypes/${id}/update`,
    DELETE: (id: string) => `/hr/loantypes/${id}/delete`,
  },
  DEDUCTION_TYPES: {
    GET_ALL: "/hr/deductiontypes",
    GET_BY_ID: (id: string) => `/hr/deductiontypes/${id}`,
    ADD: "/hr/deductiontypes/create",
    UPDATE: (id: string) => `/hr/deductiontypes/${id}/update`,
    DELETE: (id: string) => `/hr/deductiontypes/${id}/delete`,
  },
  ALLOWANCE_TYPES: {
    GET_ALL: "/hr/allowancetypes",
    GET_BY_ID: (id: string) => `/hr/allowancetypes/${id}`,
    ADD: "/hr/allowancetypes/create",
    UPDATE: (id: string) => `/hr/allowancetypes/${id}/update`,
    DELETE: (id: string) => `/hr/allowancetypes/${id}/delete`,
  },
  ALLOWANCES: {
    GET_ALL: "/hr/allowances",
    GET_BY_ID: (id: string) => `/hr/allowances/${id}`,
    ADD: "/hr/allowances/create",
    UPDATE: (id: string) => `/hr/allowances/${id}/update`,
    DELETE: (id: string) => `/hr/allowances/${id}/delete`,
  },
  DEDUCTIONS: {
    GET_ALL: "/hr/deductions",
    GET_BY_ID: (id: string) => `/hr/deductions/${id}`,
    ADD: "/hr/deductions/create",
    UPDATE: (id: string) => `/hr/deductions/${id}/update`,
    DELETE: (id: string) => `/hr/deductions/${id}/delete`,
  },
  PAYROLL: {
    GET_ALL: "/hr/payrollrecords",
    GET_BY_ID: (id: string) => `/hr/payroll/${id}`,
    ADD: "/hr/payrollrecords",
    UPDATE: (id: string) => `/hr/payroll/${id}/update`,
    DELETE: (id: string) => `/hr/payroll/${id}/delete`,
  },
  PAYROLL_PERIODS: {
    GET_ALL: "/hr/payrollschedules",
    GET_BY_ID: (id: string) => `/hr/payrollschedules/${id}`,
    ADD: "/hr/payrollschedules/create",
    UPDATE: (id: string) => `/hr/payrollschedules/${id}/update`,
    DELETE: (id: string) => `/hr/payrollschedules/${id}/delete`,
  },
};
