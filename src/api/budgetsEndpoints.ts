export const BUDGETS_ENDPOINTS = {
  FISCAL_YEARS: {
    GET_ALL: "/accounts/fiscalyear",
    GET_BY_ID: (id: string) => `/accounts/fiscalyear/${id}`,
    ADD: "/accounts/fiscalyear/create",
    UPDATE: (id: string) => `/accounts/fiscalyear/${id}/update`,
    DELETE: (id: string) => `/accounts/fiscalyear/${id}/delete`,
  },
  BUDGETS: {
    GET_ALL: "/accounts/budgets",
    GET_BY_ID: (id: string) => `/accounts/budgets/${id}`,
    ADD: "/accounts/budgets/create",
    UPDATE: (id: string) => `/accounts/budgets/${id}/update`,
    DELETE: (id: string) => `/accounts/budgets/${id}/delete`,
  },
};
