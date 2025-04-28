import { createSlice } from "@reduxjs/toolkit";

const calculateTotal = (cartItems, totalDiscount = 0) => {
  console.log('cartItems: ', cartItems)
  let subtotal = cartItems.reduce((total, item) => {
    const itemTotal = item.sellingPrice * item.quantity;
    return total + itemTotal;
  }, 0);

  return parseFloat((subtotal * (1 - totalDiscount / 100)).toFixed(3));
};

const calculateItemsCount = (cartItems) => {
  return cartItems.reduce((count, item) => {
    return count + item.quantity;
  }, 0);
};

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cartItems: [],
    totalAmount: 0,
    totalItems: 0,
    selectedItem: null,
    // orderStatus: "new",   
  },
  reducers: {
    setSelectedItem: (state, action) => {
      state.selectedItem = state.selectedItem === action.payload ? null : action.payload;
    },
    addToCart: (state, action) => {
      const product = action.payload;
      const existingItem = state.cartItems.find(
        (item) => item.productId === product.id
      );
      if (existingItem) {
        existingItem.quantity += 1;
        // existingItem.total = existingItem.quantity * product.sellingPrice;
      } else {
        state.cartItems.push({
          productId: product.id,
          productName: product.productDetails.name,
          product: product,
          unitOfMeasure: product.productDetails.unitOfMeasure,
          quantity: 1,
          sellingPrice: product.sellingPrice,
          // total: product.quantity * product.sellingPrice,
        });
      }
      state.totalItems = calculateItemsCount(state.cartItems);
      state.totalAmount = calculateTotal(state.cartItems);
      state.selectedItem = state.cartItems.find((item) => item.productId === product.id);
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.totalAmount = 0;
      state.totalItems = 0;
    },
    removeFromCart: (state, action) => {
      const id = action.payload;
      state.cartItems = state.cartItems.filter((item) => item.productId !== id);
      state.totalItems = calculateItemsCount(state.cartItems);
      state.totalAmount = calculateTotal(state.cartItems);
    },
    updateCartItemQty: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.cartItems.find((item) => item.productId === id);
      if (item) {
        item.quantity = quantity;
        // item.total = item.sellingPrice * quantity;
        state.totalItems = calculateItemsCount(state.cartItems);
        state.totalAmount = calculateTotal(state.cartItems);
      }
    },
    updateCartItems: (state, action) => {
      state.cartItems = action.payload;
      state.totalAmount = calculateTotal(state.cartItems);
      state.totalItems = calculateItemsCount(state.cartItems);
    },
    applyTotalDiscount: (state, action) => {
      state.totalDiscount = action.payload;
      state.totalAmount = calculateTotal(state.cartItems, state.totalDiscount);
    },
    updateCart: (state, action) => {
      state.orderNumber = action.payload.orderNumber;
      state.cartItems = action.payload.cartItems;
      state.totalAmount = calculateTotal(state.cartItems);
      state.totalItems = calculateItemsCount(state.cartItems);
    },
  },
});

// Export actions
export const {
  setSelectedItem,
  addToCart,
  removeFromCart,
  updateCartItemQty,
  clearCart,
  updateCart,
  applyTotalDiscount,
  updateCartItems,
} = cartSlice.actions;
export default cartSlice.reducer;
