export const REPORTS_ENDPOINTS = {
  GENERAL_LEDGERS: {
    GET_ALL: "/erp/reports/accounting/general-ledger",
  },
  TRIAL_BALANCES: {
    GET_ALL: "/erp/reports/accounting/false/detail-trial-balance",
  },
  COMPARISON_TRIAL_BALANCES: {
    GET_ALL: "/erp/reports/accounting/false/comparison-trial-balance",
  },
  COMPARISON_INCOME_STATEMENT: {
    GET_ALL: "/erp/reports/accounting/comparison-income-statement",
  },
  DETAILED_INCOME_STATEMENT: {
    GET_ALL: "/erp/reports/accounting/detail-income-statement",
  },
  DETAILED_BALANCE_SHEET: {
    GET_ALL: "/erp/reports/accounting/false/detail-balance-sheet",
  },
  COMPARISON_BALANCE_SHEET: {
    GET_ALL: "/erp/reports/accounting/false/comparison-balance-sheet",
  },
  JOURNAL_TYPES: {
    GET_ALL: "/erp/accounts/journal-types",
  },
  DASHBOARD: {
    SALES: "/erp/reports/dashboard/sales-comparison-current-vs-previous-fy",
    PROFIT_AND_LOSS: (params: { start_date: string; end_date: string }) => {
      const { start_date, end_date } = params;
      return `/erp/reports/dashboard/profit-or-loss?start_date=${encodeURIComponent(
        start_date
      )}&end_date=${encodeURIComponent(end_date)}`;
    },
    REVENUE_GROWTH: (params: { start_date: string; end_date: string }) => {
      const { start_date, end_date } = params;
      return `/erp/reports/dashboard/revenue-growth?start_date=${encodeURIComponent(
        start_date
      )}&end_date=${encodeURIComponent(end_date)}`;
    },
    EXPENSES: (params: { start_date: string; end_date: string }) => {
      const { start_date, end_date } = params;
      return `/erp/reports/dashboard/expense-summary?start_date=${encodeURIComponent(
        start_date
      )}&end_date=${encodeURIComponent(end_date)}`;
    },
    INVOICES: (params: { start_date: string; end_date: string }) => {
      const { start_date, end_date } = params;
      return `/erp/reports/dashboard/invoice-summary?start_date=${encodeURIComponent(
        start_date
      )}&end_date=${encodeURIComponent(end_date)}`;
    },
    CASH_BOOK: (params: { start_date: string; end_date: string }) => {
      const { start_date, end_date } = params;
      return `/erp/reports/accounting/cashbook/${start_date}/${end_date}`;
    },
  },
};
