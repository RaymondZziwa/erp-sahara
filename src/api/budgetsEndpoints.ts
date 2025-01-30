export const BUDGETS_ENDPOINTS = {
  FISCAL_YEARS: {
    GET_ALL: "/erp/accounts/fiscalyear",
    GET_BY_ID: (id: string) => `/erp/accounts/fiscalyear/${id}`,
    ADD: "/erp/accounts/fiscalyear/create",
    UPDATE: (id: string) => `/erp/accounts/fiscalyear/${id}/update`,
    DELETE: (id: string) => `/erp/accounts/fiscalyear/${id}/delete`,
  },
  BUDGETS: {
    GET_ALL: "/erp/accounts/budgets",
    GET_BY_ID: (id: string) => `/erp/accounts/budgets/${id}`,
    ADD: "/erp/accounts/budgets/create",
    UPDATE: (id: string) => `/erp/accounts/budgets/${id}/update`,
    DELETE: (id: string) => `/erp/accounts/budgets/${id}/delete`,
  },
};
