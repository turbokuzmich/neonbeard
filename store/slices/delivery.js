import { createSlice, createSelector } from "@reduxjs/toolkit";
import { DeliveryType } from "../../constants/delivery";
import property from "lodash/property";

export const GeoCodingStatus = {
  initial: "initial",
  failed: "failed",
  insufficient: "insufficient",
  ok: "ok",
};

export const getDelivery = (state) => state.delivery;

export const getDeliveryPhone = createSelector(getDelivery, property("phone"));
export const getDeliveryEmail = createSelector(getDelivery, property("email"));
export const getDeliveryType = createSelector(getDelivery, property("type"));

export const getDeliveryComment = createSelector(
  getDelivery,
  property("comment")
);

export const getCourierAddress = createSelector(
  getDelivery,
  property("courierAddress")
);
export const getCourierLat = createSelector(
  getDelivery,
  property("courierLat")
);
export const getCourierLng = createSelector(
  getDelivery,
  property("courierLng")
);
export const getCdekCity = createSelector(getDelivery, property("cdekCity"));
export const getCdekCitySuggestions = createSelector(
  getDelivery,
  property("cdekCitySuggestions")
);
export const getCdekPointTitle = createSelector(
  getDelivery,
  property("cdekPointTitle")
);
export const getCdekPointCode = createSelector(
  getDelivery,
  property("cdekPointCode")
);
export const getCdekPointAddress = createSelector(
  getDelivery,
  property("cdekPointAddress")
);
export const getCdekPointLat = createSelector(
  getDelivery,
  property("cdekPointLat")
);
export const getCdekPointLng = createSelector(
  getDelivery,
  property("cdekPointLng")
);

export const getDeliveryFormValues = createSelector(
  getDeliveryPhone,
  getDeliveryEmail,
  getDeliveryComment,
  getDeliveryType,
  getCourierAddress,
  getCourierLat,
  getCourierLng,
  getCdekCity,
  getCdekPointTitle,
  getCdekPointCode,
  getCdekPointAddress,
  getCdekPointLat,
  getCdekPointLng,
  (
    phone,
    email,
    comment,
    type,
    courierAddress,
    courierLat,
    courierLng,
    cdekCity,
    cdekPointTitle,
    cdekPointCode,
    cdekPointAddress,
    cdekPointLat,
    cdekPointLng
  ) => ({
    phone,
    email,
    comment,
    type,
    courierAddress,
    courierLat,
    courierLng,
    cdekCity,
    cdekPointTitle,
    cdekPointCode,
    cdekPointAddress,
    cdekPointLat,
    cdekPointLng,
  })
);

export default createSlice({
  name: "delivery",

  initialState: {
    isAPILoaded: false,

    type: DeliveryType.cdek,

    phone: "",
    email: "",
    comment: "",

    geocodingStatus: GeoCodingStatus.initial,

    courierAddress: null,
    courierAddressInput: "",
    courierAddressSuggestions: [],
    courierLat: null,
    courierLng: null,

    cdekCityTitle: "",
    cdekCitySuggestions: [],
    cdekCity: null,
    cdekPoint: null,
    cdekPoints: [],
    cdekCalculation: null,
  },

  reducers: {
    apiLoaded(state) {
      state.isAPILoaded = true;
    },
    changeCdekCityTitleInput(state, { payload }) {
      state.cdekCity = null;
      state.cdekPoints = [];
      state.cdekPoint = null;
      state.cdekCalculation = null;
      state.cdekCityTitle = payload;
    },
    setCdekCity(state, { payload }) {
      state.cdekCity = payload;
      state.cdekPoints = [];
      state.cdekPoint = null;
      state.cdekCalculation = null;
    },
    setCdekCitySuggestions(state, { payload }) {
      state.cdekCitySuggestions = payload;
      state.cdekPoints = [];
      state.cdekPoint = null;
      state.cdekCalculation = null;
    },
    setCdekPoints(state, { payload }) {
      state.cdekPoints = payload;
      state.cdekPoint = null;
      state.cdekCalculation = null;
    },
  },
});
