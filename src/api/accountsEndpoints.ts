export const ACCOUNTS_ENDPOINTS = {
  CATEGORIES: {
    GET_ALL: "/accounts/categories",
    GET_BY_ID: (id: string) => `/accounts/categories/${id}`,
    // ADD: "/accounts/categories/create",
    ADD: "/account-charts",
    UPDATE: (id: string) => `/accounts/categories/${id}/update-code`,
    DELETE: (id: string) => `/accounts/categories/${id}/delete`,
  },
  SUB_CATEGORIES: {
    GET_ALL: "/accounts/subcategories",
    GET_BY_ID: (id: string) => `/accounts/subcategories/${id}`,
    ADD: "/accounts/subcategories/create",
    UPDATE: (id: string) => `/accounts/subcategories/${id}/update`,
    DELETE: (id: string) => `/accounts/subcategories/${id}/delete`,
  },
  CHART_OF_ACCOUNTS: {
    GET_ALL: "/accounts/chartofaccounts",
    GET_BY_ID: (id: string) => `/accounts/chartofaccounts/${id}`,
    ADD: "/accounts/chartofaccounts/create",
    UPDATE: (id: string) => `/accounts/chartofaccounts/${id}/update`,
    DELETE: (id: string) => `/accounts/chartofaccounts/${id}/delete`,
    GET_ACCOUNT_DETAILS: (
      accountId: string,
      startDate: string,
      endDate: string
    ) => `/accounts/${accountId}/${startDate}/${endDate}/50/details`,
  },
  CASH_REQUISITIONS: {
    GET_ALL: "/accounts/cash-requisitions",
    GET_BY_ID: (id: string) => `/accounts/cash-requisitions/${id}`,
    ADD: "/accounts/cash-requisitions/create",
    UPDATE: (id: string) => `/accounts/cash-requisitions/${id}/update`,
    DELETE: (id: string) => `/accounts/cash-requisitions/${id}/delete`,
    APPROVE: (id: string) => `/accounts/cash-requisitions/${id}/approve`,
    REJECT: (id: string) => `/accounts/cash-requisitions/${id}/reject`,
    DISBURSE: (id: string) => `/accounts/cash-requisitions/${id}/disburse`,
  },
  FUEL_REQUISITIONS: {
    GET_ALL: "/requisitions/fuel-requisitions",
    GET_BY_ID: (id: string) => `/accounts/fuel-requisitions/${id}`,
    ADD: "/requisitions/fuel-requisitions",
    UPDATE: (id: string) => `/accounts/fuel-requisitions`
  },
  STORE_REQUISITIONS: {
    GET_ALL: "/requisitions/store-requisitions",
    GET_BY_ID: (id: string) => `/accounts/fuel-requisitions/${id}`,
    ADD: "/requisitions/store-requisitions",
    UPDATE: (id: string) => `/requisitions/store-requisitions/${id}`
  },
  APPROVAL_LEVELS: {
    GET_ALL: "/accounts/requisitions-approval-level",
    GET_BY_ID: (id: string) =>
      `/accounts/requisitions-approval-level/${id}`,
    ADD: "/accounts/requisitions-approval-level/create",
    UPDATE: (id: string) =>
      `/accounts/requisitions-approval-level/${id}/update`,
    DELETE: (id: string) =>
      `/accounts/requisitions-approval-level/${id}/delete`,
  },
  TRANSACTIONS: {
    SAVE_EXPENSE: "/accounts/transactions/save-expense",
    UPDATE: (id: string) => `/accounts/transactions/save-expense/${id}`,
  },
  GET_EXPENSE_ACCOUNTS: "/accounts/get-expense-accounts",
  GET_INCOME_ACCOUNTS: "/accounts/get-income-accounts",
  GET_ASSET_ACCOUNTS: "/accounts/get-asset-accounts",
  GET_LIABILITY_ACCOUNTS: "/accounts/get-liability-accounts",
  GET_CASH_ACCOUNTS: "/accounts/get-cash-accounts",
  GET_RECEIVABLE_ACCOUNTS: "/accounts/get-receivable-accounts",
  GET_PREPAID_ACCOUNTS: "/accounts/get-prepaid-accounts",
  GET_ALL_ACCOUNTS: "/accounts/get-all-accounts",
  GET_FISCAL_YEARS: "/accounts/fiscalyear",
  GET_ACCOUNT_BALANCES: "/reports/dashboard/cash-balances"
};
