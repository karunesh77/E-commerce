import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import { registerStore } from "./storeRegistry";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

registerStore(store);
