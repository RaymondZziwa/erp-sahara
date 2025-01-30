import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { DataState } from "../types/DataState";


export interface User {
  id: number;
  user: {
    id: string,
    first_name: string,
    last_name: string,
    email: string,
    gender: string,
    date_of_birth: string,
    phone_number: string,
    role_id: number,
    profilePicture: string,
    signaturePicture: string,
  }
}

const initialState: DataState<User[]> = {
  data: [],
  loading: false,
  error: null,
};

const UsersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<User[]>) {
      state.loading = false;
      state.data = action.payload;
      state.error = null;
    },
    fetchDataFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchDataStart, fetchDataSuccess, fetchDataFailure } =
  UsersSlice.actions;
export default UsersSlice.reducer;
