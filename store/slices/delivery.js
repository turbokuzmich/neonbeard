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

export const getDeliveryFio = createSelector(getDelivery, property("fio"));
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
export const getCdekCityCode = createSelector(getCdekCity, property("code"));
export const getCdekPoints = createSelector(
  getDelivery,
  property("cdekPoints")
);
export const getCdekCitySuggestions = createSelector(
  getDelivery,
  property("cdekCitySuggestions")
);
export const getCdekPoint = createSelector(getDelivery, property("cdekPoint"));
export const getCdekCalculation = createSelector(
  getDelivery,
  property("cdekCalculation")
);
export const getCdekPointTitle = createSelector(getCdekPoint, property("name"));
export const getCdekPointCode = createSelector(getCdekPoint, property("code"));
export const getCdekPointAddress = createSelector(
  getCdekPoint,
  property(["location", "address_full"])
);
export const getCdekPointLat = createSelector(
  getCdekPoint,
  property(["location", "latitude"])
);
export const getCdekPointLng = createSelector(
  getCdekPoint,
  property(["location", "longitude"])
);

export const getDeliveryFormValues = createSelector(
  getDeliveryFio,
  getDeliveryPhone,
  getDeliveryEmail,
  getDeliveryComment,
  getDeliveryType,
  getCourierAddress,
  getCourierLat,
  getCourierLng,
  getCdekCityCode,
  getCdekPointTitle,
  getCdekPointCode,
  getCdekPointAddress,
  getCdekPointLat,
  getCdekPointLng,
  (
    fio,
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
    fio,
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

    fio: "",
    phone: "",
    email: "",
    comment: "",

    geocodingStatus: GeoCodingStatus.initial,

    courierAddress: "",
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
    setFio(state, { payload }) {
      state.fio = payload;
    },
    setPhone(state, { payload }) {
      state.phone = payload;
    },
    setEmail(state, { payload }) {
      state.email = payload;
    },
    setComment(state, { payload }) {
      state.comment = payload;
    },
    setCourierAddress(state, { payload }) {
      state.courierAddress = payload;
    },
    setType(state, { payload }) {
      state.type = payload;

      if (payload === DeliveryType.courier) {
        state.cdekCityTitle = "";
        state.cdekCitySuggestions = [];
        state.cdekCity = null;
        state.cdekPoint = null;
        state.cdekPoints = [];
        state.cdekCalculation = null;
      }
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
    },
    setCdekPoints(state, { payload }) {
      state.cdekPoints = payload;
      state.cdekPoint = null;
      state.cdekCalculation = null;
    },
    setCdekPoint(state, { payload }) {
      state.cdekPoint = payload;
      state.cdekCalculation = null;
    },
    setCdekCalculation(state, { payload }) {
      state.cdekCalculation = payload;
    },
  },
});
