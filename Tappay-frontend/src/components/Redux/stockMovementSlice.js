import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

// Async thunk to fetch stock movements
export const fetchStockMovementsThunk = createAsyncThunk(
  "stockMovement/fetchStockMovements",
  async () => {
    const response = await axiosInstance.get("/stock-movements");
    console.log("response stock movement", response);
    return response.data;
  }
);

// Async thunk to move stock
export const moveStockThunk = createAsyncThunk(
  "stockMovement/moveStock",
  async (stockMovementData) => {
    const response = await axiosInstance.post(
      "/stock-movements",
      stockMovementData
    );
    console.log("response stock movement", response);
    return response.data;
  }
);

export const undoStockMovementThunk = createAsyncThunk(
  "stockMovement/undoStockMovement",
  async (stockMovementId) => {
    const response = await axiosInstance.post(
      `/stock-movements/undo?stockMovementId=${stockMovementId}`
    );
    return response.data;
  }
);

// export 

// Initial state
const initialState = {
  stockMovements: [],
  productsToMove: [],
  loading: false,
  error: null,
};

// Stock movement slice
const stockMovementSlice = createSlice({
  name: "stockMovement",
  initialState,
  reducers: {
    setProductsToMove: (state, action) => {
      state.productsToMove = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStockMovementsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStockMovementsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.stockMovements = action.payload;
      })
      .addCase(fetchStockMovementsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(moveStockThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(moveStockThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.stockMovements.push(action.payload);
      })
      .addCase(moveStockThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(undoStockMovementThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(undoStockMovementThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.stockMovements = state.stockMovements.filter(
          (movement) => movement.id !== action.payload.id
        );
      })
      .addCase(undoStockMovementThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setProductsToMove } = stockMovementSlice.actions;

export default stockMovementSlice.reducer;
