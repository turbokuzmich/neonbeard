import cart from "../slices/cart";

import { all, call, put, takeLatest, getContext } from "redux-saga/effects";

export function* fetchCartItems() {
  try {
    const { getCart } = yield getContext("api");

    yield put(cart.actions.fetch());

    const items = yield call(getCart);

    yield put(cart.actions.fetchComplete({ items }));
  } catch (_) {
    yield put(cart.actions.fetchComplete({ items: [] }));
  }
}

export function* changeItem({ payload }) {
  const { id } = payload;

  try {
    const { changeItem: change } = yield getContext("api");

    const items = yield call(change, payload);

    yield put(cartSlice.actions.changeItemComplete({ id, items }));
  } catch (error) {
    console.log(error);
  }
}

export default function* root() {
  yield all([takeLatest(cart.actions.changeItem, changeItem)]);

  yield call(fetchCartItems);
}
