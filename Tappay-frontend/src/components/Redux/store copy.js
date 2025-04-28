// store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web

// Import your slice reducers
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

// Combine all your reducers
const rootReducer = combineReducers({
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
});

// Configure persist settings.
// Here, we persist the entire state, but you can whitelist or blacklist specific reducers.
const persistConfig = {
  key: 'root',
  storage,
  // For example, to persist only the 'inventory' slice:
  // whitelist: ['inventory']
};

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the store with the persisted reducer
export const store = configureStore({
  reducer: persistedReducer,
});

// Create the persistor which is used to persist the store
export const persistor = persistStore(store);
