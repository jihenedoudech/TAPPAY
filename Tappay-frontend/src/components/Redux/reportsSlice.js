import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import salesSummary from "../../data/salesSummary.json";
import salesByItem from "../../data/salesByItem.json";
import usersReports from "../../data/usersReports.json";
import axiosInstance from "../../utils/axiosInstance";

// Async thunk to fetch sales summary
export const fetchSalesSummary = createAsyncThunk(
  "reports/fetchSalesSummary",
  async (filters) => {
    console.log("filter reports:", filters);
    const response = await axiosInstance.get("/reports/sales-summary", {
      params: filters,
    });
    console.log("response.data reports:", response.data);
    return response.data;
    // return salesSummary;
  }
);

export const fetchProductsReports = createAsyncThunk(
  "reports/fetchProductsReports",
  async (filters) => {
    console.log("filters", filters);
    const response = await axiosInstance.get("/reports/products-reports", {
      params: filters,
    });
    return response.data;
    // return salesByItem;
  }
);

export const fetchUsersReports = createAsyncThunk(
  "reports/fetchUsersReports",
  async (filters) => {
    const response = await axiosInstance.get("/reports/users-reports", {
      params: filters,
    });
    return response.data;
    // return usersReports;
  }
);

const reportsSlice = createSlice({
  name: "reports",
  initialState: {
    salesSummary: {},
    productsReports: {},
    usersReports: {},
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSalesSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSalesSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.salesSummary = action.payload;
      })
      .addCase(fetchSalesSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductsReports.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductsReports.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productsReports = action.payload;
      })
      .addCase(fetchProductsReports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchUsersReports.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsersReports.fulfilled, (state, action) => {
        state.isLoading = false;
        state.usersReports = action.payload;
      })
      .addCase(fetchUsersReports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default reportsSlice.reducer;
