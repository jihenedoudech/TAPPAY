import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

export const fetchShiftsThunk = createAsyncThunk(
  "shifts/fetchShifts",
  async () => {
    const response = await axiosInstance.get("/shifts");
    console.log("response: ", response.data);
    return response.data;
  }
);

export const fetchCurrentUserShiftThunk = createAsyncThunk(
  "shifts/fetchCurrentUserShift",
  async () => {
    const response = await axiosInstance.get("/shifts/current");
    return response.data;
  }
);

export const fetchShiftByIdThunk = createAsyncThunk(
  "shifts/fetchShiftById",
  async (id) => {
    const response = await axiosInstance.get(`/shifts/${id}`);
    return response.data[0];
  }
);

export const openShiftThunk = createAsyncThunk(
  "shifts/openShift",
  async (openingCashAmount) => {
    const response = await axiosInstance.post("/shifts/open", {
      openingCashAmount,
      storeId: localStorage.getItem("currentStoreId"),
    });
    return response.data;
  }
);

export const closeShiftThunk = createAsyncThunk(
  "shifts/closeShift",
  async ({ id }) => {
    const response = await axiosInstance.post(`/shifts/close/${id}`);
    return response.data;
  }
);


const shiftSlice = createSlice({
  name: "shifts",
  initialState: {
    shiftsList: [],
    shiftDetails: null,
    currentUserShift: null,
    loading: false,
    error: null,
  },
  reducers: {
    // openShift: (state, action) => {
    //   const newShift = {
    //     id: state.shiftsList.length + 1,
    //     startTime: new Date().toISOString(),
    //     startingAmount: action.payload.startingAmount,
    //     totalSales: 0,
    //     status: 'Open'
    //   };
    //   state.shiftsList.push(newShift);
    //   state.currentShift = newShift;
    // },
    // closeShift: (state, action) => {
    //   if (state.currentShift) {
    //     state.currentShift.endTime = new Date().toISOString();
    //     state.currentShift.totalSales = action.payload.totalSales;
    //     state.currentShift.status = 'Closed';
    //     state.currentShift = null;
    //   }
    // }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShiftsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchShiftsThunk.fulfilled, (state, action) => {
        state.shiftsList = action.payload;
        state.loading = false;
      })
      .addCase(fetchShiftsThunk.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      .addCase(fetchCurrentUserShiftThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUserShiftThunk.fulfilled, (state, action) => {
        state.currentUserShift = action.payload;
        state.loading = false;
      })
      .addCase(fetchCurrentUserShiftThunk.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      .addCase(openShiftThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(openShiftThunk.fulfilled, (state, action) => {
        state.currentUserShift = action.payload;
        state.loading = false;
      })
      .addCase(openShiftThunk.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      .addCase(closeShiftThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(closeShiftThunk.fulfilled, (state, action) => {
        state.currentUserShift = null;
        state.loading = false;
      })
      .addCase(closeShiftThunk.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      });
  },
});

export const selectShiftById = (state, id) =>
  state.shifts.shiftsList.find((shift) => shift.id === id);

export const { openShift, closeShift } = shiftSlice.actions;
export default shiftSlice.reducer;
