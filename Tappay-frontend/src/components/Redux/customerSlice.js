// src/Redux/customerSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

export const fetchCustomersThunk = createAsyncThunk(
  "customers/fetchCustomersThunk",
  async () => {
    const response = await axiosInstance.get("/customers");
    return response.data;
  }
);

export const addCustomerThunk = createAsyncThunk(
  "customers/addCustomerThunk",
  async (customer) => {
    const response = await axiosInstance.post("/customers", customer);
    return response.data;
  }
);

export const deleteCustomerThunk = createAsyncThunk(
  "customers/deleteCustomerThunk",
  async (id) => {
    console.log("id: ", id);
    const response = await axiosInstance.delete(`/customers/${id}`);
    console.log("response: ", response);
    return response.data;
  }
);

const customerSlice = createSlice({
  name: "customers",
  initialState: {
    customersList: [],
    selectedCustomer: null,
    loading: false,
    error: null,
  },
  reducers: {
    addCustomer: (state, action) => {
      state.customersList.push(action.payload);
    },
    selectCustomer: (state, action) => {
      state.selectedCustomer = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomersThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCustomersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.customersList = action.payload;
      })
      .addCase(fetchCustomersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addCustomerThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(addCustomerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.customersList.push(action.payload);
      })
      .addCase(addCustomerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteCustomerThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCustomerThunk.fulfilled, (state, action) => {
        console.log("action: ", action);
        state.loading = false;
        state.customersList = state.customersList.filter(
          (customer) => customer.id !== action.payload
        );
      })
      .addCase(deleteCustomerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { addCustomer, selectCustomer } = customerSlice.actions;
export const selectCustomers = (state) => state.customers;
export default customerSlice.reducer;
