import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

const initialState = {
  paymentMethods: [],
  selectedPaymentMethod: null,
  totalAmountDue: 0,
  totalPaidAmount: 0,
  remainingAmount: 0,
  changeAmount: 0,
  isFullyPaid: false,
  loading: false,
  error: null,
};

const caculateTotals = (state) => {
  state.totalPaidAmount = state.paymentMethods?.reduce(
    (acc, payment) => acc + payment.amount,
    0
  );
  state.remainingAmount = Math.max(0, state.totalAmountDue - state.totalPaidAmount);
  state.changeAmount = Math.max(0, state.totalPaidAmount - state.totalAmountDue);
  state.isFullyPaid = state.totalPaidAmount >= state.totalAmountDue;
};

export const payOrderThunk = createAsyncThunk(
  "payment/payOrder",
  async (payment) => {
    const response = await axiosInstance.post(`/payments`, payment);
    return response.data;
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    initiatePayment: (state, action) => {
      state.totalAmountDue = action.payload;
      caculateTotals(state);
    },
    addPaymentMethod: (state, action) => {
      const { method, amount, ...rest } = action.payload;
      const existingPayment = state.paymentMethods.find(
        (payment) => payment.method === method
      );
      if (existingPayment) {
        existingPayment.amount += parseFloat(amount);
      } else {
        state.paymentMethods.push({ method, amount: parseFloat(amount), ...rest });
      }
      state.selectedPaymentMethod = method;
      caculateTotals(state);
    },
    updatePaymentMethod: (state, action) => {
      const { amount } = action.payload;
      const existingPayment = state.paymentMethods.find(
        (payment) => payment.method === state.selectedPaymentMethod
      );
      existingPayment.amount = amount;
      caculateTotals(state);
    },
    removePaymentMethod: (state, action) => {
      const { method } = action.payload;
      console.log("method: ", method);
      const paymentIndex = state.paymentMethods.findIndex(
        (payment) => payment.method === method
      );

      if (paymentIndex !== -1) {
        state.paymentMethods.splice(paymentIndex, 1);
        caculateTotals(state);
      }
    },
    selectPaymentMethod: (state, action) => {
      state.selectedPaymentMethod = action.payload;
    },
    resetPayments: (state) => {
      state.paymentMethods = [];
      state.selectedPaymentMethod = null;
      state.totalAmountDue = 0;
      state.totalPaidAmount = 0;
      state.remainingAmount = 0;
      state.isFullyPaid = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(payOrderThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(payOrderThunk.fulfilled, (state) => {
      state.loading = false;
    })
    .addCase(payOrderThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
  },
});

export const {
  initiatePayment,
  addPaymentMethod,
  updatePaymentMethod,
  removePaymentMethod,
  resetPayments,
  selectPaymentMethod,
} = paymentSlice.actions;

export default paymentSlice.reducer;
