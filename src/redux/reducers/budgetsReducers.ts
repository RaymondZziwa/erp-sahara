import budgetsSlice from "../slices/budgets/budgetsSlice";
import fiscalYearsSlice from "../slices/budgets/fiscalYearsSlice";
import projectsSlice from "../slices/projects/projectsSlice";

export const BUDGET_REDUCERS = {
  fiscalYears: fiscalYearsSlice,
  budgets: budgetsSlice,
  projects: projectsSlice,
};
