import assetsReducer from "../slices/assets/assetsSlice"; 
import assetsCategoriesReducer from "../slices/assets/assetCategoriesSlice"; 


export const ASSETS_REDUCERS = {
  assets: assetsReducer, 
    assetCategories: assetsCategoriesReducer,
};