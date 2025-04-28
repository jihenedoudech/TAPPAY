import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

// Async thunk for fetching purchase records
export const fetchPurchasesRecordsThunk = createAsyncThunk(
  "purchase/fetchPurchasesRecords",
  async () => {
    const response = await axiosInstance.get("/purchase-records");
    return response.data;
  }
);

export const fetchOneWithCurrentQuantitiesThunk = createAsyncThunk(
  "purchase/fetchOneWithCurrentQuantities",
  async (id) => {
    const response = await axiosInstance.get(`/purchase-records/current-quantities/${id}`);
    return response.data;
  }
);

// Async thunk for adding a new purchase record
export const addPurchaseRecordThunk = createAsyncThunk(
  "purchase/addPurchaseRecord",
  async (purchaseData) => {
    console.log("purchaseData: ", purchaseData);
    const response = await axiosInstance.post(
      "/purchase-records",
      purchaseData
    );
    console.log("response: ", response.data);
    return response.data;
  }
);

export const deletePurchaseRecordThunk = createAsyncThunk(
  "purchase/deletePurchaseRecord",
  async (id, { rejectWithValue }) => {
    console.log("id: ", id);
    try {
      const response = await axiosInstance.delete(`/purchase-records/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const deletePurchaseItemThunk = createAsyncThunk(
  "purchase/deletePurchaseItem",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/purchase-records/items/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Async thunk for fetching suppliers
export const fetchSuppliersThunk = createAsyncThunk(
  "purchase/fetchSuppliers",
  async () => {
    const response = await axiosInstance.get("/suppliers");
    return response.data;
  }
);

export const addSupplierThunk = createAsyncThunk(
  "purchase/addSupplier",
  async (supplierData) => {
    const response = await axiosInstance.post("/suppliers", supplierData);
    return response.data;
  }
);

export const updatePurchaseCommonDataThunk = createAsyncThunk(
  "purchase/updatePurchaseCommonData",
  async ({id, purchaseData}) => {
    console.log("id: ", id);
    console.log("purchaseData: ", purchaseData);
    const response = await axiosInstance.put(`/purchase-records/update-common-data/${id}`, purchaseData);
    return response.data;
  }
);

export const updatePurchaseItemThunk = createAsyncThunk(
  "purchase/updatePurchaseItem",
  async ({id, purchaseItemData}) => {
    console.log("id: ", id);
    console.log("purchaseItemData: ", purchaseItemData);
    const response = await axiosInstance.put(`/purchase-records/update-item/${id}`, purchaseItemData);
    console.log("response: ", response);
    return response.data;
  }
);

export const findPurchaseRecordOfItemThunk = createAsyncThunk(
  "purchase/findPurchaseRecordOfItem",
  async (id) => {
    const response = await axiosInstance.get(`/purchase-records/find-purchase-record-of-item/${id}`);
    return response.data;
  }
);

const purchaseSlice = createSlice({
  name: "purchase",
  initialState: {
    purchases: [], // Array to hold purchase records
    suppliers: [], // Array to hold suppliers
    loading: false, // Loading state for purchase and suppliers
    error: null, // Error state for purchase and suppliers
  },
  reducers: {
    clearPurchase: (state) => {
      state.purchases = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch purchase cases
      .addCase(fetchPurchasesRecordsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPurchasesRecordsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.purchases = action.payload;
      })
      .addCase(fetchPurchasesRecordsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Add purchase record cases
      .addCase(addPurchaseRecordThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(addPurchaseRecordThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.purchases.push(action.payload); // Add the new record to the purchase
      })
      .addCase(addPurchaseRecordThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Delete purchase record cases
      .addCase(deletePurchaseRecordThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(deletePurchaseRecordThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.purchases = state.purchases.filter(
          (purchase) => purchase._id !== action.payload
        );
      })
      .addCase(deletePurchaseRecordThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deletePurchaseItemThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(deletePurchaseItemThunk.fulfilled, (state, action) => {
        state.loading = false;
        // Update the state to remove the deleted item
        state.purchases = state.purchases.map(purchase => {
          if (purchase.id === action.meta.arg) {
            return {
              ...purchase,
              purchasedItems: purchase.purchasedItems.filter(item => item.id !== action.payload)
            };
          }
          return purchase;
        });
      })
      .addCase(deletePurchaseItemThunk.rejected, (state, action) => {
        state.loading = false;
        console.log("action.payload: ", action.payload);
        state.error = action.payload;
      })
      // Fetch suppliers cases
      .addCase(fetchSuppliersThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSuppliersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = action.payload;
      })
      .addCase(fetchSuppliersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addSupplierThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(addSupplierThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers.push(action.payload);
      })
      .addCase(addSupplierThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearPurchase } = purchaseSlice.actions;

export const selectPurchaseById = (state, id) =>
  state.purchase.purchases.find((purchase) => purchase.id === id);

export default purchaseSlice.reducer;
