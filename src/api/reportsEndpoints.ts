export const REPORTS_ENDPOINTS = {
  GENERAL_LEDGERS: {
    GET_ALL: "/reports/accounting/general-ledger?start_date=2025-01-01&end_date=2025-02-16",
  },
  TRIAL_BALANCES: {
    GET_ALL: "/reports/accounting/detail-trial-balance",
  },
  COMPARISON_TRIAL_BALANCES: {
    GET_ALL: "/reports/accounting/comparison-trial-balance",
  },
  COMPARISON_INCOME_STATEMENT: {
    GET_ALL: "/reports/accounting/comparison-income-statement",
  },
  DETAILED_INCOME_STATEMENT: {
    GET_ALL: "/reports/accounting/detail-income-statement",
  },
  DETAILED_BALANCE_SHEET: {
    GET_ALL: "/reports/accounting/detail-balance-sheet",
  },
  COMPARISON_BALANCE_SHEET: {
    GET_ALL: "/reports/accounting/comparison-balance-sheet",
  },
  JOURNAL_TYPES: {
    GET_ALL: "/accounts/journal-types",
  },
  CASH_FLOW_STATEMENT: {
    GET_ALL: "/reports/accounting/cash-flow-statement-indirect",
  },
  DETAILED_CASH_BOOK: {
    GET_ALL: "/reports/accounting/cashbook/2024-01-01/2024-12-01",
  },
  DASHBOARD: {
    SALES: "/reports/dashboard/sales-comparison-current-vs-previous-fy",
    PROFIT_AND_LOSS: (params: { start_date: string; end_date: string }) => {
      const { start_date, end_date } = params;
      return `/reports/dashboard/profit-or-loss?start_date=${encodeURIComponent(
        start_date
      )}&end_date=${encodeURIComponent(end_date)}`;
    },
    REVENUE_GROWTH: (params: { start_date: string; end_date: string }) => {
      const { start_date, end_date } = params;
      return `/reports/dashboard/revenue-growth?start_date=${encodeURIComponent(
        start_date
      )}&end_date=${encodeURIComponent(end_date)}`;
    },
    EXPENSES: (params: { start_date: string; end_date: string }) => {
      const { start_date, end_date } = params;
      return `/reports/dashboard/expense-summary?start_date=${encodeURIComponent(
        start_date
      )}&end_date=${encodeURIComponent(end_date)}`;
    },
    INVOICES: (params: { start_date: string; end_date: string }) => {
      const { start_date, end_date } = params;
      return `/reports/dashboard/invoice-summary?start_date=${encodeURIComponent(
        start_date
      )}&end_date=${encodeURIComponent(end_date)}`;
    },
    CASH_BOOK: (params: { start_date: string; end_date: string }) => {
      const { start_date, end_date } = params;
      return `/reports/accounting/cashbook/${start_date}/${end_date}`;
    },
    CASH_BALANCES: {
      GET_ALL: "/reports/dashboard/cash-balances-two",
    }
  },
};