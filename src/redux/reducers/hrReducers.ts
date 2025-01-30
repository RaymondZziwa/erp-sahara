import attendenciesSlice from "../slices/hr/attendenciesSlice";
import departmentsSlice from "../slices/hr/departmentsSlice";
import designationSlice from "../slices/hr/designationSlice";
import employeesSlice from "../slices/hr/employeesSlice";
import leaveApplicationSlice from "../slices/hr/leaveApplicationSlice";
import leavesSlice from "../slices/hr/leavesSlice";
import payrollPeriodSlice from "../slices/hr/payrollPeriodSlice";
import allowancesSlice from "../slices/hr/salary/allowancesSlice";
import allowanceTypeSlice from "../slices/hr/salary/allowanceTypeSlice";
import bonusTypesSlice from "../slices/hr/salary/bonusTypesSlice";
import deductionsSlice from "../slices/hr/salary/deductionsSlice";
import deductionTypesSlice from "../slices/hr/salary/deductionTypesSlice";
import loanTypesSlice from "../slices/hr/salary/loanTypesSlice";
import salaryStructureSlice from "../slices/hr/salaryStructureSlice";

export const HR_REDUCERS = {
  departments: departmentsSlice,
  designations: designationSlice,
  salaryStructures: salaryStructureSlice,
  employees: employeesSlice,
  attendencies: attendenciesSlice,
  leaveTypes: leavesSlice,
  leaveApplications: leaveApplicationSlice,
  bonusTypes: bonusTypesSlice,
  loanTypes: loanTypesSlice,
  deductionTypes: deductionTypesSlice,
  allowanceType: allowanceTypeSlice,
  payrollPeriods: payrollPeriodSlice,
  allowances: allowancesSlice,
  deductions: deductionsSlice,
};
