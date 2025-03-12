import generalLedgersSlice from "../slices/reports/ledgers/generalLedgersSlice";
import journalTypesSlice from "../slices/reports/ledgers/journalTypesSlice";
import trialBalanceSllice from "../slices/reports/ledgers/trialBalanceSllice";
import incomeStatementSlice from "../slices/reports/ledgers/incomeStatementSlice";
import balanceSheetSlice from "../slices/reports/ledgers/balanceSheetSlice";

export const REPORTS_REDUCERS = {
  generalLedgers: generalLedgersSlice,
  journalTypes: journalTypesSlice,
  trialBalance: trialBalanceSllice,
  incomeStatement: incomeStatementSlice,
  balanceSheet: balanceSheetSlice,
};
