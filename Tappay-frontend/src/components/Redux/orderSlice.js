import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

const generateOrderNumber = (ordersList) => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const formattedDate = `${day}${month}`;

  // Filter orders by the date in the orderNumber (not dateTime)
  const todayOrders = ordersList.filter((order) => {
    const orderDate = order.orderNumber.split("-")[0]; // Extract the DDMM part from the orderNumber
    return orderDate === formattedDate; // Compare with today's date
  });

  // Find the highest order number for today
  let highestOrderNumber = 0;
  todayOrders.forEach((order) => {
    const orderNum = parseInt(order.orderNumber.split("-")[1], 10); // Get the part after the "-"
    if (orderNum > highestOrderNumber) {
      highestOrderNumber = orderNum;
    }
  });

  // Increment the order count and return the new order number
  const paddedOrderCount = String(highestOrderNumber + 1).padStart(4, "0");
  return `${formattedDate}-${paddedOrderCount}`;
};

export const fetchOrdersThunk = createAsyncThunk(
  "orders/fetchOrders",
  async () => {
    const response = await axiosInstance.get("/orders");
    console.log("response: ", response.data);
    return response.data;
  }
);

export const fetchOrdersByDateThunk = createAsyncThunk(
  "orders/fetchByDate",
  async (date) => {
    const response = await axiosInstance.get(`/orders/by-date/${date}`);
    return response.data;
  }
);

export const createOrderThunk = createAsyncThunk(
  "orders/createOrder",
  async (orderData, { getState }) => {
    const shiftState = getState().shifts;
    console.log("shiftState: ", shiftState);
    const newOrder = {
      orderNumber: orderData.orderNumber,
      dateTime: new Date().toISOString(),
      totalAmount: orderData.cart.totalAmount,
      totalItems: orderData.cart.totalItems,
      purchasedItems: orderData.cart.cartItems,
      customer: orderData.customer?.id,
      shiftId: shiftState.currentUserShift.id,
      storeId: localStorage.getItem("currentStoreId"),
    };
    console.log("newOrder: ", newOrder);
    const response = await axiosInstance.post("/orders", newOrder); // Adjust the URL as needed
    return response.data; // Return the created order data
  }
);

export const updateOrderThunk = createAsyncThunk(
  "orders/updateOrder",
  async (orderData) => {
    const { orderId, updatedOrder } = orderData;
    console.log("orderData: ", orderData);
    console.log("orderId: ", orderId);
    console.log("updatedOrder: ", updatedOrder);
    const response = await axiosInstance.patch(
      `/orders/${orderId}`,
      updatedOrder
    );
    return response.data; // Return the updated order data
  }
);

export const refundOrderThunk = createAsyncThunk(
  "orders/refundOrder",
  async (orderData) => {
    const { orderId, refundItems } = orderData;
    console.log("orderData: ", orderData);
    console.log("orderId: ", orderId);
    console.log("refundItems: ", refundItems);
    const response = await axiosInstance.post(
      `/orders/refund/${orderId}`,
      refundItems
    );
    return response.data;
  }
);

export const deleteOrderThunk = createAsyncThunk(
  "orders/deleteOrder",
  async (orderId) => {
    const response = await axiosInstance.delete(`/orders/${orderId}`);
    return response.data;
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    ordersList: [],
    currentOrder: null,
    orderNumber: null,
    loading: false,
    error: null,
  },
  reducers: {
    // createOrder: (state, action) => {
    //   const { cart, customer } = action.payload;
    //   const newOrder = {
    //     orderNumber: cart.orderNumber || `ORD${state.ordersList.length + 1}`, // generate if missing
    //     dateTime: new Date().toISOString(),
    //     totalAmount: cart.totalAmount,
    //     totalItems: cart.totalItems,
    //     purchasedItems: cart.cartItems,
    //     customer: customer || null
    //   };
    //   state.ordersList = [...state.ordersList, newOrder];
    //   console.log(
    //     "Updated ordersList",
    //     JSON.parse(JSON.stringify(state.ordersList))
    //   );
    //   state.currentOrder = newOrder;
    // },
    // updateOrderStatus: (state, action) => {
    //   const { orderNumber, status } = action.payload;
    //   const orderIndex = state.ordersList.findIndex(
    //     (order) => order.orderNumber === orderNumber
    //   );
    //   if (orderIndex !== -1) {
    //     state.ordersList[orderIndex].status = status;
    //   }
    // },
    setOrderNumber: (state) => {
      state.orderNumber = generateOrderNumber(state.ordersList);
    },
    selectCurrentOrder: (state, action) => {
      const { order } = action.payload;
      state.orderNumber = order.orderNumber;
      // const selectedOrder = state.ordersList.find(
      //   (order) => order.orderNumber === orderNumber
      // );
      state.currentOrder = order || null;
    },
    resetCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrdersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.ordersList = action.payload;
      })
      .addCase(fetchOrdersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createOrderThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrderThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.ordersList.push(action.payload);
        state.currentOrder = action.payload;
      })
      .addCase(createOrderThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateOrderThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.ordersList = state.ordersList.map((order) =>
          order.id === action.payload.id ? action.payload : order
        );
        state.currentOrder = action.payload;
      })
      .addCase(updateOrderThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(refundOrderThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refundOrderThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.ordersList = state.ordersList.map((order) =>
          order.id === action.payload.id ? action.payload : order
        );
      })
      .addCase(refundOrderThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteOrderThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrderThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.ordersList = state.ordersList.filter(
          (order) => order.id !== action.payload.id
        );
      })
      .addCase(deleteOrderThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { selectCurrentOrder, resetCurrentOrder, setOrderNumber } =
  orderSlice.actions;
export const selectOrderById = (state, id) =>
  state.orders.ordersList.find((order) => order.id === id);
export default orderSlice.reducer;
