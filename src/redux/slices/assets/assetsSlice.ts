import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";
import { Asset } from "../types/mossApp/assets/asset";

// Define the initial state using the DataState type
const initialState: DataState<Asset[]> = {
  data: [],
  loading: false,
  error: null,
};

// Create the slice
const assetsSlice = createSlice({
  name: "assets", // Slice name
  initialState, // Initial state
  reducers: {
    // Action to indicate the start of data fetching
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    // Action to handle successful data fetching
    fetchDataSuccess(state, action: PayloadAction<Asset[]>) {
      state.loading = false;
      state.data = action.payload; // Update the state with the fetched data
      state.error = null; // Clear any previous errors
    },
    // Action to handle data fetching failure
    fetchDataFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload; // Set the error message
    },
  },
});

// Export the actions
export const { fetchDataStart, fetchDataSuccess, fetchDataFailure } =
  assetsSlice.actions;

// Export the reducer
export default assetsSlice.reducer;