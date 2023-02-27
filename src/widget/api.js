import axios from "axios";
import get from "lodash/get";
import throttle from "lodash/throttle";

const api = axios.create({
  baseURL: "https://neon-beard.ru/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const withCSRFCheck = (function () {
  const check = throttle(async function () {
    await api.get("/check");
  }, 30000);

  return function (handler) {
    return async function (...args) {
      const waitCheck = check();

      if (waitCheck) {
        await waitCheck;
      }

      return handler(...args);
    };
  };
})();

const getCatalog = withCSRFCheck(async () => {
  return api
    .get("/catalog")
    .then((response) => get(response, ["data"], []))
    .catch(() => []);
});

const getCart = withCSRFCheck(async () => {
  return api
    .get("/cart")
    .then((response) => get(response, ["data", "items"], []))
    .catch(() => []);
});

const changeItem = withCSRFCheck(async (item) => {
  return api
    .post("/cart", item)
    .then((response) => get(response, ["data", "items"], []))
    .catch(() => []);
});

const getCdekCities = withCSRFCheck(async (title) => {
  return api
    .get("/cdek/cities", { params: { title } })
    .then((response) => get(response, ["data"], []))
    .catch(() => []);
});

const getOrder = withCSRFCheck(async (token = "") => {
  return api
    .get("/order", { params: { token } })
    .then((response) => get(response, ["data", "order"], null));
});

const getCdekPoints = withCSRFCheck(async (city) => {
  return api
    .get("/cdek/points", { params: { city } })
    .then((response) => get(response, ["data"], []))
    .catch(() => []);
});

const calculateCdekTariff = withCSRFCheck(async (code, address) => {
  return api
    .get("/cdek/calculate", { params: { code, address } })
    .then((response) => get(response, ["data"], []))
    .catch(() => []);
});

const checkout = withCSRFCheck(async (data) => {
  return api
    .post("/checkout", data)
    .then((response) => get(response, ["data", "url"]))
    .catch(() => undefined);
});

export default {
  getCart,
  checkout,
  getOrder,
  getCatalog,
  changeItem,
  getCdekCities,
  getCdekPoints,
  calculateCdekTariff,
};
