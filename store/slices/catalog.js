import { createSlice, createSelector } from "@reduxjs/toolkit";
import property from "lodash/property";

export const CatalogState = {
  initial: "initial",
  fetching: "fetching",
  fetched: "fetched",
};

export const getCatalog = property("catalog");
export const getState = createSelector(getCatalog, property("state"));
export const getOld = createSelector(getCatalog, property("old"));
export const getUniversal = createSelector(getCatalog, property("universal"));

export default createSlice({
  name: "catalog",
  initialState: {
    id: {},
    old: {},
    list: [],
    universal: {},
    state: CatalogState.initial,
  },
  reducers: {
    fetch(state) {
      state.state = CatalogState.fetching;
    },
    fetchComplete(state, { payload: { id, old, list, universal } }) {
      state.id = id;
      state.old = old;
      state.list = list;
      state.universal = universal;
      state.state = CatalogState.fetched;
    },
  },
});
