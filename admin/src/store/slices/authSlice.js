import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginApi, logoutApi, getMeApi, refreshTokenApi } from "../../api/auth.api";

export const bootstrapAuth = createAsyncThunk("auth/bootstrap", async (_, { rejectWithValue }) => {
  try {
    const refreshRes = await refreshTokenApi();
    const accessToken = refreshRes.data.data.accessToken;
    const meRes = await getMeApi();
    if (meRes.data.data.role !== "admin") return rejectWithValue("Not an admin account");
    return { user: meRes.data.data, accessToken };
  } catch {
    return rejectWithValue(null);
  }
});

export const loginAdmin = createAsyncThunk("auth/login", async (formData, { rejectWithValue }) => {
  try {
    const res = await loginApi(formData);
    if (res.data.data.user.role !== "admin") {
      // Non-admin credentials are valid but not allowed here — clear the
      // cookies the backend just set, since this session shouldn't persist
      await logoutApi().catch(() => {});
      return rejectWithValue("This account does not have admin access");
    }
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Login failed");
  }
});

export const logoutAdmin = createAsyncThunk("auth/logout", async () => {
  await logoutApi();
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    accessToken: null,
    status: "idle",
    bootstrapped: false,
    error: null,
  },
  reducers: {
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.bootstrapped = true;
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.bootstrapped = true;
      })
      .addCase(loginAdmin.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
      });
  },
});

export const { setAccessToken, logout } = authSlice.actions;
export default authSlice.reducer;
