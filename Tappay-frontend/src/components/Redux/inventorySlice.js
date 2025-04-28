import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

export const fetchInventoriesThunk = createAsyncThunk(
  "inventory/fetchInventories",
  async () => {
    const response = await axiosInstance.get("/inventory");
    return response.data;
  }
);

export const fetchInventoryByIdThunk = createAsyncThunk(
  "inventory/fetchInventoryById",
  async (inventoryId) => {
    const response = await axiosInstance.get(`/inventory/${inventoryId}`);
    return response.data;
  }
);

export const createInventoryThunk = createAsyncThunk(
  "inventory/createInventory",
  async (inventory) => {
    const response = await axiosInstance.post("/inventory", inventory);
    return response.data;
  }
);

export const deleteInventoryThunk = createAsyncThunk(
  "inventory/deleteInventory",
  async (inventoryId) => {
    const response = await axiosInstance.delete(`/inventory/${inventoryId}`);
    return response.data;
  }
);

// Initial state
const initialState = {
  inventories: [],
  selectedStoreId: null,
  loading: false,
  error: null,
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    setSelectedStoreId: (state, action) => {
      state.selectedStoreId = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchInventoriesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoriesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.inventories = action.payload;
      })
      .addCase(fetchInventoriesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteInventoryThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInventoryThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.inventories = state.inventories.filter(
          (inventory) => inventory.id !== action.payload.id
        );
      })
      .addCase(deleteInventoryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setSelectedStoreId } = inventorySlice.actions;

export default inventorySlice.reducer;
