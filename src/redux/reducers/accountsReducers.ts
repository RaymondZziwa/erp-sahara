import accountCategoriesSlice from "../slices/accounts/accountCategoriesSlice";
import accountSubCategoriesSlice from "../slices/accounts/accountSubCategoriesSlice";
import chartOfAccountsSlice from "../slices/accounts/chartOfAccountsSlice";
import cashRequisitionsSlice from "../slices/accounts/cash_requisitions/cashRequisitionsSlice";
import ledgerChartOfAccountsSlice from "../slices/accounts/ledgerChartOfAccountsSlice";
import approvalLevels from "../slices/accounts/cash_requisitions/approvalLevelsSlice";

export const ACCOUNTS_REDUCERS = {
  accountCategories: accountCategoriesSlice,
  accountSubCategories: accountSubCategoriesSlice,
  chartOfAccounts: chartOfAccountsSlice,
  cashRequisitions: cashRequisitionsSlice,
  ledgerChartOfAccounts: ledgerChartOfAccountsSlice,
  approvalLevels,
};
