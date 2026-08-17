import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getCartApi,
  addToCartApi,
  updateCartItemApi,
  removeCartItemApi,
  clearCartApi,
} from "../../api/cart.api";
import toast from "react-hot-toast";

export const fetchCart = createAsyncThunk("cart/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await getCartApi();
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const addToCart = createAsyncThunk("cart/add", async (data, { rejectWithValue }) => {
  try {
    const res = await addToCartApi(data);
    toast.success("Added to cart");
    return res.data.data;
  } catch (err) {
    const message = err.response?.data?.message || "Could not add to cart";
    toast.error(message);
    return rejectWithValue(message);
  }
});

export const updateCartItem = createAsyncThunk(
  "cart/updateItem",
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const res = await updateCartItemApi(itemId, { quantity });
      return res.data.data;
    } catch (err) {
      const message = err.response?.data?.message || "Could not update item";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const removeCartItem = createAsyncThunk(
  "cart/removeItem",
  async (itemId, { rejectWithValue }) => {
    try {
      const res = await removeCartItemApi(itemId);
      toast.success("Item removed");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const clearCart = createAsyncThunk("cart/clear", async (_, { rejectWithValue }) => {
  try {
    const res = await clearCartApi();
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const initialState = {
  items: [],
  summary: { totalItems: 0, uniqueItems: 0, subtotal: 0, shipping: 0, total: 0 },
  status: "idle",
};

const applyCartData = (state, data) => {
  state.items = data.items;
  state.summary = data.summary;
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCart: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
      })
      .addMatcher(
        (action) =>
          [fetchCart.fulfilled, addToCart.fulfilled, updateCartItem.fulfilled, removeCartItem.fulfilled, clearCart.fulfilled].some(
            (type) => type.type === action.type
          ),
        (state, action) => {
          state.status = "succeeded";
          applyCartData(state, action.payload);
        }
      );
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
