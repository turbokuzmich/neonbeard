import { createSlice, createSelector } from "@reduxjs/toolkit";
import get from "lodash/get";
import property from "lodash/property";

export const CartState = {
  initial: "initial",
  fetching: "fetching",
  fetched: "fetched",
  delivery: "delivery",
  payment: "payment",
  success: "success",
};

export const getCart = property("cart");

export const getCartState = createSelector(getCart, property("state"));

export const getCartItems = createSelector(getCart, (cart) =>
  get(cart, "items", [])
);

export const getCartItemsCount = createSelector(getCartItems, (items) =>
  items.map(property("qty")).reduce((count, qty) => count + qty, 0)
);

export default createSlice({
  name: "cart",
  initialState: {
    state: CartState.initial,
    items: [],
    changing: {},
  },
  reducers: {
    fetch(state) {
      state.state = CartState.fetching;
    },
    fetchComplete(state, { payload: { items } }) {
      state.items = items;
      state.state = CartState.fetched;
    },
    changeItem(state, { payload: { id, variant, qty = 1, append = false } }) {
      state.changing[id] = true;

      const index = state.items.findIndex(
        ({ itemId, variantId }) => itemId === id && variantId === variant
      );

      if (index > -1) {
        state.items[index].qty = append ? state.items[index].qty + qty : qty;
      } else {
        state.items.push({ itemId: id, variantId: variant, qty });
      }
    },
    changeItemComplete(state, { payload: { id, items } }) {
      state.changing[id] = false;
      state.items = items;
    },
  },
});
