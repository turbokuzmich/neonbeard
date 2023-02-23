import { call, put, getContext } from "redux-saga/effects";
import cart from "../slices/cart";

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

export default function* root() {
  yield call(fetchCartItems);
}
