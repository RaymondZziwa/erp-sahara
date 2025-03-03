export const ACCOUNTS_ENDPOINTS = {
  CATEGORIES: {
    GET_ALL: "/erp/accounts/categories",
    GET_BY_ID: (id: string) => `/erp/accounts/categories/${id}`,
    // ADD: "/erp/accounts/categories/create",
    ADD: "/erp/account-charts",
    UPDATE: (id: string) => `/erp/accounts/categories/${id}/update`,
    DELETE: (id: string) => `/erp/accounts/categories/${id}/delete`,
  },
  SUB_CATEGORIES: {
    GET_ALL: "/erp/accounts/subcategories",
    GET_BY_ID: (id: string) => `/erp/accounts/subcategories/${id}`,
    ADD: "/erp/accounts/subcategories/create",
    UPDATE: (id: string) => `/erp/accounts/subcategories/${id}/update`,
    DELETE: (id: string) => `/erp/accounts/subcategories/${id}/delete`,
  },
  CHART_OF_ACCOUNTS: {
    GET_ALL: "/erp/accounts/chartofaccounts",
    GET_BY_ID: (id: string) => `/erp/accounts/chartofaccounts/${id}`,
    ADD: "/erp/accounts/chartofaccounts/create",
    UPDATE: (id: string) => `/erp/accounts/chartofaccounts/${id}/update`,
    DELETE: (id: string) => `/erp/accounts/chartofaccounts/${id}/delete`,
    GET_ACCOUNT_DETAILS: (
      accountId: string,
      startDate: string,
      endDate: string
    ) => `/erp/accounts/${accountId}/${startDate}/${endDate}/50/details`,
  },

  CASH_REQUISITIONS: {
    GET_ALL: "/erp/accounts/cash-requisitions",
    GET_BY_ID: (id: string) => `/erp/accounts/cash-requisitions/${id}`,
    ADD: "/erp/accounts/cash-requisitions/create",
    UPDATE: (id: string) => `/erp/accounts/cash-requisitions/${id}/update`,
    DELETE: (id: string) => `/erp/accounts/cash-requisitions/${id}/delete`,
    APPROVE: (id: string) => `/erp/accounts/cash-requisitions/${id}/approve`,
    REJECT: (id: string) => `/erp/accounts/cash-requisitions/${id}/reject`,
    DISBURSE: (id: string) => `/erp/accounts/cash-requisitions/${id}/disburse`,
  },
  APPROVAL_LEVELS: {
    GET_ALL: "/erp/accounts/requisitions-approval-level",
    GET_BY_ID: (id: string) =>
      `/erp/accounts/requisitions-approval-level/${id}`,
    ADD: "/erp/accounts/requisitions-approval-level/create",
    UPDATE: (id: string) =>
      `/erp/accounts/requisitions-approval-level/${id}/update`,
    DELETE: (id: string) =>
      `/erp/accounts/requisitions-approval-level/${id}/delete`,
  },
  TRANSACTIONS: {
    SAVE_EXPENSE: "/erp/accounts/transactions/save-expense",
    UPDATE: (id: string) => `/erp/accounts/transactions/save-expense/${id}`,
  },
  GET_EXPENSE_ACCOUNTS: "/erp/accounts/get-expense-accounts",
  GET_INCOME_ACCOUNTS: "/erp/accounts/get-income-accounts",
  GET_ASSET_ACCOUNTS: "/erp/accounts/get-asset-accounts",
  GET_LIABILITY_ACCOUNTS: "/erp/accounts/get-liability-accounts",
  GET_CASH_ACCOUNTS: "/erp/accounts/get-cash-accounts",
  GET_RECEIVABLE_ACCOUNTS: "/erp/accounts/get-receivable-accounts",
  GET_PREPAID_ACCOUNTS: "/erp/accounts/get-prepaid-accounts",
  GET_ALL_ACCOUNTS: "/erp/accounts/get-all-accounts",
  GET_ACCOUNT_BALANCES: "/erp/reports/dashboard/cash-balances"
};
