export const HUMAN_RESOURCE_ENDPOINTS = {
  DEPARTMENTS: {
    GET_ALL: "/erp/hr/departments",
    GET_BY_ID: (id: string) => `/erp/hr/departments/${id}`,
    ADD: "/erp/hr/departments/create",
    UPDATE: (id: string) => `/erp/hr/departments/${id}/update`,
    DELETE: (id: string) => `/erp/hr/departments/${id}/delete`,
  },
  DESIGNATIONS: {
    GET_ALL: "/erp/hr/designations",
    GET_BY_ID: (id: string) => `/erp/hr/designations/${id}`,
    ADD: "/erp/hr/designations/create",
    UPDATE: (id: string) => `/erp/hr/designations/${id}/update`,
    DELETE: (id: string) => `/erp/hr/designations/${id}/delete`,
  },
  SALARY_STRUCTURES: {
    GET_ALL: "/erp/hr/salarystructure",
    GET_BY_ID: (id: string) => `/erp/hr/salarystructure/${id}`,
    ADD: "/erp/hr/salarystructure/create",
    UPDATE: (id: string) => `/erp/hr/salarystructure/${id}/update`,
    DELETE: (id: string) => `/erp/hr/salarystructure/${id}/delete`,
  },
  EMPLOYEES: {
    GET_ALL: "/erp/hr/employees",
    GET_BY_ID: (id: string) => `/erp/hr/employees/${id}`,
    ADD: "/erp/hr/employees/create",
    UPDATE: (id: string) => `/erp/hr/employees/${id}/update`,
    DELETE: (id: string) => `/erp/hr/employees/${id}/delete`,
  },
  ATTENDENCIES: {
    GET_ALL: "/erp/hr/attendance",
    GET_BY_ID: (id: string) => `/erp/hr/attendance/${id}`,
    ADD: "/erp/hr/attendance/create",
    UPDATE: (id: string) => `/erp/hr/attendance/${id}/update`,
    DELETE: (id: string) => `/erp/hr/attendance/${id}/delete`,
  },
  PAYROLL_PERIODS: {
    GET_ALL: "/erp/hr/payrollperiods",
    GET_BY_ID: (id: string) => `/erp/hr/payrollperiods/${id}`,
    ADD: "/erp/hr/payrollperiods/create",
    UPDATE: (id: string) => `/erp/hr/payrollperiods/${id}/update`,
    DELETE: (id: string) => `/erp/hr/payrollperiods/${id}/delete`,
  },
  LEAVE_TYPES: {
    GET_ALL: "/erp/hr/leavetypes",
    GET_BY_ID: (id: string) => `/erp/hr/leavetypes/${id}`,
    ADD: "/erp/hr/leavetypes/create",
    UPDATE: (id: string) => `/erp/hr/leavetypes/${id}/update`,
    DELETE: (id: string) => `/erp/hr/leavetypes/${id}/delete`,
  },
  LEAVE_APPLICATIONS: {
    GET_ALL: "/erp/hr/leaveapplications",
    GET_BY_ID: (id: string) => `/erp/hr/leaveapplications/${id}`,
    ADD: "/erp/hr/leaveapplications/create",
    UPDATE: (id: string) => `/erp/hr/leaveapplications/${id}/update`,
    DELETE: (id: string) => `/erp/hr/leaveapplications/${id}/delete`,
  },
  BONUS_TYPES: {
    GET_ALL: "/erp/hr/bonustypes",
    GET_BY_ID: (id: string) => `/erp/hr/bonustypes/${id}`,
    ADD: "/erp/hr/bonustypes/create",
    UPDATE: (id: string) => `/erp/hr/bonustypes/${id}/update`,
    DELETE: (id: string) => `/erp/hr/bonustypes/${id}/delete`,
  },
  LOAN_TYPES: {
    GET_ALL: "/erp/hr/loantypes",
    GET_BY_ID: (id: string) => `/erp/hr/loantypes/${id}`,
    ADD: "/erp/hr/loantypes/create",
    UPDATE: (id: string) => `/erp/hr/loantypes/${id}/update`,
    DELETE: (id: string) => `/erp/hr/loantypes/${id}/delete`,
  },
  DEDUCTION_TYPES: {
    GET_ALL: "/erp/hr/deductiontypes",
    GET_BY_ID: (id: string) => `/erp/hr/deductiontypes/${id}`,
    ADD: "/erp/hr/deductiontypes/create",
    UPDATE: (id: string) => `/erp/hr/deductiontypes/${id}/update`,
    DELETE: (id: string) => `/erp/hr/deductiontypes/${id}/delete`,
  },
  ALLOWANCE_TYPES: {
    GET_ALL: "/erp/hr/allowancetypes",
    GET_BY_ID: (id: string) => `/erp/hr/allowancetypes/${id}`,
    ADD: "/erp/hr/allowancetypes/create",
    UPDATE: (id: string) => `/erp/hr/allowancetypes/${id}/update`,
    DELETE: (id: string) => `/erp/hr/allowancetypes/${id}/delete`,
  },
  ALLOWANCES: {
    GET_ALL: "/erp/hr/allowances",
    GET_BY_ID: (id: string) => `/erp/hr/allowances/${id}`,
    ADD: "/erp/hr/allowances/create",
    UPDATE: (id: string) => `/erp/hr/allowances/${id}/update`,
    DELETE: (id: string) => `/erp/hr/allowances/${id}/delete`,
  },
  DEDUCTIONS: {
    GET_ALL: "/erp/hr/deductions",
    GET_BY_ID: (id: string) => `/erp/hr/deductions/${id}`,
    ADD: "/erp/hr/deductions/create",
    UPDATE: (id: string) => `/erp/hr/deductions/${id}/update`,
    DELETE: (id: string) => `/erp/hr/deductions/${id}/delete`,
  },
  PAYROLL: {
    GET_ALL: "/erp/hr/payroll",
    GET_BY_ID: (id: string) => `/erp/hr/payroll/${id}`,
    ADD: "/erp/hr/payroll/create",
    UPDATE: (id: string) => `/erp/hr/payroll/${id}/update`,
    DELETE: (id: string) => `/erp/hr/payroll/${id}/delete`,
  },
};
