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
    GET_USAGE_SUMMARY: ''
  },
  BUDGET_CATEGORIES: {
    GET_ALL: "/accounts/budgetcategories",
    ADD: "/accounts/budgetcategories/create",
    UPDATE: (id: string) => `/accounts/budgetcategories/${id}/update`,
    DELETE: (id: string) => `/accounts/budgetcategories/${id}/delete`
  }
};
