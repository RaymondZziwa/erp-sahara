import workCentersSlice from "../slices/manufacturing/workCenters/workCentersSlice";
import workCenterOrdersSlice from "../slices/manufacturing/workCenters/workCenterOrdersSlice";
import equipmentSlice from "../slices/manufacturing/workCenters/equipmentSlice";
import maintainanceLogSlice from "../slices/manufacturing/workCenters/maintainanceLogSlice";
import centerTasksSlice from "../slices/manufacturing/workCenters/centerTasksSlice";
import capacityLogSlice from "../slices/manufacturing/workCenters/centerCapacityLog";
import centerDownTimeLogSlice from "../slices/manufacturing/workCenters/centerDownTimeLog";
import billOfMaterialSlice from "../slices/manufacturing/workCenters/billOfMaterialSlice";
import productionLinesSlice from "../slices/manufacturing/workCenters/productionLinesSlice";
import machineAssignmentsSlice from "../slices/manufacturing/workCenters/machineAssignmentsSlice";
import productionPlansSlice from "../slices/manufacturing/workCenters/productionPlansSlice";
import productionPlansSchedulesSlice from "../slices/manufacturing/workCenters/productionPlanScheduleSlice";
import productionPlanMaterialSlice from "../slices/manufacturing/workCenters/productionPlanMaterialSlice";

export const MANUFACTURING_REDUCERS = {
  workcenters: workCentersSlice,
  workCenterOrders: workCenterOrdersSlice,
  equipment: equipmentSlice,
  equipmentMaintainance: maintainanceLogSlice,
  centerTasks: centerTasksSlice,
  capacityLogs: capacityLogSlice,
  centerDownTimeLogs: centerDownTimeLogSlice,
  billOfMaterial: billOfMaterialSlice,
  productionLines: productionLinesSlice,
  machineAssignments: machineAssignmentsSlice,
  productionPlans: productionPlansSlice,
  productionPlansSchedules: productionPlansSchedulesSlice,
  productionPlansMaterials: productionPlanMaterialSlice,
};
