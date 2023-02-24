import cart, { startTimer, stopTimer } from "../slices/cart";
import catalog from "../slices/catalog";
import axios from "axios";
import { parse } from "../../lib/helpers/catalog";

import {
  all,
  call,
  put,
  race,
  take,
  delay,
  takeLatest,
  getContext,
  cancel,
  spawn,
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
  const { id, variant } = payload;

  try {
    const { changeItem: change } = yield getContext("api");

    const items = yield call(change, payload);

    yield put(cart.actions.changeItemComplete({ id, variant, items }));
    yield put(cart.actions.showNotification());
  } catch (error) {
    // FIXME show error
    console.log(error);
  }
}

export function* hideNotification() {
  yield delay(6000);
  yield put(cart.actions.hideNotification());
}

export function* watchNotification() {
  let timer = null;

  while (true) {
    const { show, hide, start, stop } = yield race({
      stop: take(stopTimer),
      start: take(startTimer),
      show: take(cart.actions.showNotification),
      hide: take(cart.actions.hideNotification),
    });

    if (show || start) {
      timer = yield spawn(hideNotification);
    } else if (hide || stop) {
      yield cancel(timer);
    }
  }
}

export default function* root() {
  yield all([takeLatest(cart.actions.changeItem, changeItem)]);

  yield spawn(fetchCatalog);
  yield spawn(fetchCartItems);
  yield spawn(watchNotification);
}
