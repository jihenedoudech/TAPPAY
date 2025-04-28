import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

// Async thunk to fetch expenses
export const fetchExpensesThunk = createAsyncThunk(
  "expense/fetchExpenses",
  async () => {
    const response = await axiosInstance.get("/expenses");
    return response.data;
  }
);

// Async thunk to add an expense
export const addExpensesThunk = createAsyncThunk(
  "expense/addExpense",
  async (expenseData) => {
    const response = await axiosInstance.post("/expenses/bulk", expenseData);
    console.log("response expenses", response);
    return response.data;
  }
);

// Initial state
const initialState = {
  expenses: [],
  expenseProducts: [],
  loading: false,
  error: null,
};

// Expense slice
const expenseSlice = createSlice({
  name: "expense",
  initialState,
  reducers: {
    setExpenseProducts: (state, action) => {
      state.expenseProducts = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpensesThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchExpensesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
      })
      .addCase(fetchExpensesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addExpensesThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(addExpensesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses.push(action.payload);
      })
      .addCase(addExpensesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setExpenseProducts } = expenseSlice.actions;

export default expenseSlice.reducer;
