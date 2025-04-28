import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import axiosInstance from "../../utils/axiosInstance";
import { clearCurrentStoreId } from "./storeSlice";
import config from "../../config";

// Async thunk for login
export const loginThunk = createAsyncThunk(
  "user/login",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(config.API_BASE_URL + "/auth/login", {
        username,
        password,
      });
      console.log("response of login: ", response);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk for logout
export const logoutThunk = createAsyncThunk(
  "user/logout",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/auth/logout");
      dispatch(clearCurrentStoreId());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchUsersThunk = createAsyncThunk("user/getUsers", async () => {
  const response = await axiosInstance.get("/users");
  console.log("users: ", response.data);
  return response.data;
});

export const fetchCurrentUserThunk = createAsyncThunk(
  "user/getUser",
  async () => {
    const response = await axiosInstance.get("/auth/current-user");
    return response.data;
  }
);

export const addUserThunk = createAsyncThunk("user/addUser", async (user) => {
  const response = await axiosInstance.post("/users/register", user);
  console.log("response of add user: ", response);
  return response.data;
});

export const updateUserThunk = createAsyncThunk(
  "user/update",
  async ({ id, user }) => {
    const response = await axiosInstance.patch(`/users/${id}`, user);
    console.log("response of update user: ", response);
    return response.data;
  }
);

export const changePasswordThunk = createAsyncThunk(
  "user/changePassword",
  async ({ id, currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `/users/${id}/change-password`,
        { currentPassword, newPassword }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteUserThunk = createAsyncThunk(
  "user/deleteUser",
  async (id) => {
    const response = await axiosInstance.delete(`/users/${id}`);
    console.log("response of delete user: ", response);
    return response.data;
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    users: [],
    user: null,
    currentUserRole: null,
    token: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        console.log("payload of login: ", action.payload);
        state.loading = false;
        state.user = action.payload.user;
        console.log("user of login: ", state.user);
        state.token = action.payload.access_token;
        localStorage.setItem("token", action.payload.access_token); // Store token in localStorage
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to login";
      })
      .addCase(logoutThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.error = null;
        state.currentUserRole = null;
        localStorage.removeItem("token");
        localStorage.removeItem("currentStoreId");
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to logout";
      })
      .addCase(fetchUsersThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch users";
      })
      .addCase(fetchCurrentUserThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.currentUserRole = action.payload.role;
      })
      .addCase(fetchCurrentUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to get user";
      })
      .addCase(addUserThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(addUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.users.push(action.payload);
      })
      .addCase(addUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to add user";
      })
      .addCase(updateUserThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.map((user) =>
          user.id === action.payload.id ? action.payload : user
        );
      })
      .addCase(updateUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update user";
      })
      .addCase(deleteUserThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(
          (user) => user.id !== action.payload.id
        );
      })
      .addCase(deleteUserThunk.rejected, (state, action) => {
        state.loading = false;
      });
  },
});

export default userSlice.reducer;
