import customerOrdersSlice from "../slices/sales/customerOrdersSlice";
import distributionOrdersSlice from "../slices/sales/distributionOrdersSlice";
import leadsSlice from "../slices/sales/leadsSlice";
import quotationsSlice from "../slices/sales/quotationsSlice";

export const SALES_REDUCERS = {
  quotations: quotationsSlice,
  leads: leadsSlice,
  customerOrders: customerOrdersSlice,
  distributionOrders: distributionOrdersSlice,
};
