import { configureStore } from "@reduxjs/toolkit";
import { isServer } from "../lib/helpers/features";
import cart from "./slices/cart";
import catalog from "./slices/catalog";
import saga from "./sagas";
import createSagaMiddleware from "@redux-saga/core";

export default function (api) {
  const defaultConfig = {
    reducer: {
      [cart.name]: cart.reducer,
      [catalog.name]: catalog.reducer,
    },
  };

  if (isServer()) {
    return configureStore(defaultConfig);
  }

  const sagas = createSagaMiddleware({ context: { api } });

  const store = configureStore({
    ...defaultConfig,
    devTools: process.env.NODE_ENV === "development",
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ thunk: false }).concat(sagas),
  });

  sagas.run(saga);

  return store;
}
