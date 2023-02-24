import cart from "../slices/cart";
import catalog from "../slices/catalog";
import axios from "axios";
import { parse } from "../../lib/helpers/catalog";

import {
  all,
  call,
  fork,
  put,
  delay,
  takeLatest,
  getContext,
} from "redux-saga/effects";

export function* fetchCatalog() {
  try {
    yield put(catalog.actions.fetch());

    const { data } = yield call(
      [axios, axios.get],
      "https://neon-beard.ru/widget.html"
    );

    yield put(
      catalog.actions.fetchComplete(parse("https://neon-beard.ru", data))
    );
  } catch (error) {
    // FIXME show error
  }
}

export function* fetchCartItems() {
  try {
    const { getCart } = yield getContext("api");

    yield put(cart.actions.fetch());

    const items = yield call(getCart);

    yield put(cart.actions.fetchComplete({ items }));
  } catch (_) {
    // FIXME show error
    yield put(cart.actions.fetchComplete({ items: [] }));
  }
}

export function* changeItem({ payload }) {
  const { id } = payload;

  try {
    const { changeItem: change } = yield getContext("api");

    const items = yield call(change, payload);

    yield put(cart.actions.changeItemComplete({ id, items }));
    yield put(cart.actions.showNotification());
  } catch (error) {
    // FIXME show error
    console.log(error);
  }
}

export function* autoHideNotification() {
  yield delay(6000);
  yield put(cart.actions.hideNotification());
}

export default function* root() {
  yield all([
    takeLatest(cart.actions.changeItem, changeItem),
    takeLatest(cart.actions.showNotification, autoHideNotification),
  ]);

  yield fork(fetchCatalog);
  yield fork(fetchCartItems);
}
