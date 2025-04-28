import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

export const fetchStoresThunk = createAsyncThunk(
  "stores/fetchStores",
  async () => {
    const response = await axiosInstance.get("/stores");
    return response.data;
  }
);

export const selectStoreThunk = createAsyncThunk(
  "stores/selectStore",
  async (storeId) => {
    const response = await axiosInstance.post(`/stores/select-store/${storeId}`);
    return response.data;
  }
);

export const addStoreThunk = createAsyncThunk(
  "stores/addStore",
  async (store) => {
    console.log("store: ", store);
    const response = await axiosInstance.post("/stores", store);
    console.log("response: ", response);
    return response.data;
  }
);

const initialState = {
  storesList: [],
  currentStoreId: null,
  loading: false,
  error: null,
};

const storeSlice = createSlice({
  name: "stores",
  initialState,
  reducers: {
    clearCurrentStoreId(state) {
      state.currentStoreId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStoresThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStoresThunk.fulfilled, (state, action) => {
        state.storesList = action.payload;
        state.loading = false;
      })
     .addCase(fetchStoresThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(selectStoreThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(selectStoreThunk.fulfilled, (state, action) => {
        state.selectedStore = action.payload;
        state.loading = false;
        localStorage.setItem("currentStoreId", action.payload.id);
      })
      .addCase(selectStoreThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addStoreThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(addStoreThunk.fulfilled, (state, action) => {
        console.log("action: ", action);
        state.storesList.push(action.payload);
        state.loading = false;
      })
      .addCase(addStoreThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearCurrentStoreId } = storeSlice.actions;

export default storeSlice.reducer;
