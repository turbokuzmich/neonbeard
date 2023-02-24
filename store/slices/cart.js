import { createSlice, createSelector } from "@reduxjs/toolkit";
import get from "lodash/get";
import property from "lodash/property";
import { getUniversal } from "./catalog";
import { getUniversalId } from "../../lib/helpers/catalog";

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

export const getNotification = createSelector(
  getCart,
  property("notification")
);

export const getCartItems = createSelector(getCart, (cart) =>
  get(cart, "items", [])
);

export const getCartItemsCount = createSelector(getCartItems, (items) =>
  items.map(property("qty")).reduce((count, qty) => count + qty, 0)
);

export const getCartSubtotal = createSelector(
  getCartItems,
  getUniversal,
  (items, universal) =>
    items.reduce(
      (total, { itemId, variantId, qty }) =>
        total +
        get(
          universal,
          [getUniversalId({ id: itemId, variant: variantId }), "price"],
          0
        ) *
          qty,
      0
    )
);

export default createSlice({
  name: "cart",
  initialState: {
    state: CartState.initial,
    items: [],
    changing: {},
    notification: false,
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
    showNotification(state) {
      state.notification = true;
    },
    hideNotification(state) {
      state.notification = false;
    },
  },
});
