import { configureStore } from "@reduxjs/toolkit";
import userAuthReducer from "../redux/slices/user/userAuthSlice";
//procurement
import itemsReducer from "../redux/slices/procurement/itemsSlice";
import categoriesReducer from "../redux/slices/procurement/categoriesSlice";
import unitsReducer from "../redux/slices/procurement/unitsOfMeasurementSlice";
import currenciesReducer from "../redux/slices/procurement/currenciesSlice";
import purchaseRequestsReducer from "../redux/slices/procurement/purchaseRequestsSlice";
import requestForQuotationReducer from "../redux/slices/procurement/requestForQuotationSlice";
import bidsReducer from "../redux/slices/procurement/bidsSlice";
import suppliersSlice from "../redux/slices/procurement/suppliersSlice";
import bidEvaluationReducer from "../redux/slices/procurement/bidEvaluationSlice";
import bidEvaluationCriteriaReducer from "../redux/slices/procurement/bidEvaluationCriteriaSlice";
import purchaseOrdersReducer from "../redux/slices/procurement/purchaseOrdersSlice";
import goodReceivedNotesReducer from "../redux/slices/procurement/goodsReceivedNoteSlice";

//inventory
import inventoryCategoriesReducer from "../redux/slices/inventory/itemCategoriesSlice";
import inventoryItemsReducer from "../redux/slices/inventory/itemsSlice";
import inventoryUomReducer from "../redux/slices/inventory/unitsOfMeasurementSlice";
import inventorySuppliersReducer from "../redux/slices/inventory/suppliersSlice";
import inventoryWarehouseReducer from "../redux/slices/inventory/warehousesSlice";
import brandsReducer from "../redux/slices/inventory/brandsSlice";
import inventoriesReducer from "../redux/slices/inventory/inventoriesSlice";
import inventoryVariantsReducer from "../redux/slices/inventory/variantsSlice";
import customersReducer from "../redux/slices/inventory/customersSlice";
import trucksSlice from "../redux/slices/inventory/trucksSlice";
import driversReducer from "../redux/slices/inventory/driversSlice";
import itemsAttributesReducer from "../redux/slices/inventory/attributesSlice";
import itemsAttributesValuesReducer from "../redux/slices/inventory/attributesValueSlice";
import stockMovementSlice from "../redux/slices/inventory/stockMovementSlice";
import paymentMethodReducer from '../redux/slices/accounts/payment_method'
import MOSS_APP_REDUCERS from "./reducers/mossAppReducers";
import { SALES_REDUCERS } from "./reducers/salesReducers";
import { ACCOUNTS_REDUCERS } from "./reducers/accountsReducers";
import { HR_REDUCERS } from "./reducers/hrReducers";
import { BUDGET_REDUCERS } from "./reducers/budgetsReducers";
import { PROJECTS_REDUCERS } from "./reducers/projectsReducers";
import { REPORTS_REDUCERS } from "./reducers/reportsReducers";
import { MANUFACTURING_REDUCERS } from "./reducers/manufacturingReducers";


//roles
import  RoleReducer from './slices/roles/roleSlice'
//users
import UsersReducer from './slices/user/usersSlice'
//approval levels
import ApprovalLevelsReducer from './slices/approval_levels/levelSlice'

const store = configureStore({
  reducer: {
    paymentMethods: paymentMethodReducer,
    levels: ApprovalLevelsReducer,
    usersList: UsersReducer,
    roles: RoleReducer,
    userAuth: userAuthReducer,
    items: itemsReducer,
    categories: categoriesReducer,
    units: unitsReducer,
    currencies: currenciesReducer,
    purchaseRequests: purchaseRequestsReducer,
    requestForQuotation: requestForQuotationReducer,
    bids: bidsReducer,
    suppliers: suppliersSlice,
    bidEvaluations: bidEvaluationReducer,
    bidEvaluationCriteria: bidEvaluationCriteriaReducer,
    purchaseOrders: purchaseOrdersReducer,
    goodsRecivedNotes: goodReceivedNotesReducer,
    inventoryCategories: inventoryCategoriesReducer,
    inventoryItems: inventoryItemsReducer,
    inventoryUnits: inventoryUomReducer,
    inventorySuppliers: inventorySuppliersReducer,
    warehouses: inventoryWarehouseReducer,
    inventoryBrands: brandsReducer,
    inventories: inventoriesReducer,
    variants: inventoryVariantsReducer,
    customers: customersReducer,
    drivers: driversReducer,
    trucks: trucksSlice,
    itemsAttributes: itemsAttributesReducer,
    itemsAttributesValues: itemsAttributesValuesReducer,
    stockMovements: stockMovementSlice,
    ...MOSS_APP_REDUCERS,
    ...SALES_REDUCERS,
    ...ACCOUNTS_REDUCERS,
    ...HR_REDUCERS,
    ...BUDGET_REDUCERS,
    ...PROJECTS_REDUCERS,
    ...REPORTS_REDUCERS,
    ...MANUFACTURING_REDUCERS,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export default store;
