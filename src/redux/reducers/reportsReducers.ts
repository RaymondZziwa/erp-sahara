import generalLedgersSlice from "../slices/reports/ledgers/generalLedgersSlice";
import journalTypesSlice from "../slices/reports/ledgers/journalTypesSlice";
import trialBalanceSllice from "../slices/reports/ledgers/trialBalanceSllice";

export const REPORTS_REDUCERS = {
  generalLedgers: generalLedgersSlice,
  journalTypes: journalTypesSlice,
  trialBalance: trialBalanceSllice,
};
