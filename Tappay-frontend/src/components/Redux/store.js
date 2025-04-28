import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./productSlice";
import customerReducer from "./customerSlice";
import orderReducer from "./orderSlice";
import paymentReducer from "./paymentSlice";
import cartReducer from "./cartSlice";
import shiftReducer from "./shiftSlice";
import purchaseReducer from "./purchaseSlice";
import userReducer from "./userSlice";
import storeReducer from "./storeSlice";
import reportsReducer from "./reportsSlice";
import stockMovementReducer from "./stockMovementSlice";
import expenseReducer from "./expenseSlice";
import inventoryReducer from "./inventorySlice";

export const store = configureStore({
  reducer: {
    products: productReducer,
    customers: customerReducer,
    orders: orderReducer,
    payment: paymentReducer,
    cart: cartReducer,
    shifts: shiftReducer,
    purchase: purchaseReducer,
    user: userReducer,
    store: storeReducer,
    reports: reportsReducer,
    stockMovement: stockMovementReducer,
    expenses: expenseReducer,
    inventory: inventoryReducer,
  },
});