import axios from "axios";
import get from "lodash/get";
import throttle from "lodash/throttle";

const api = axios.create({
  baseURL: "https://neonbeard.ru/api",
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

export default { getCart, changeItem };
