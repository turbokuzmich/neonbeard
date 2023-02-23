import Cookies from "js-cookie";
import makeStore from "../store";
import cart from "../store/slices/cart";
import axios from "axios";
import throttle from "lodash/throttle";
import get from "lodash/get";
import { tempItems } from "../constants/catalog";

const apiRootUrl = "https://neonbeard.ru/api";
const experimentCookieName = "payment";

const api = (function () {
  const api = axios.create({
    baseURL: apiRootUrl,
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
      .then(response, get(response, ["data", "items"], []))
      .catch(() => []);
  });

  return { getCart, changeItem };
})();

function setupButton(store) {
  const oldId = document.querySelector("[name=shk-id]").value;
  const button = document.querySelector(".product-action button[type=submit]");

  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const { id, variant } = tempItems[oldId];
    const qty = parseInt(
      document.querySelector("[type=number][name=shk-count]").value
    );

    store.dispatch(cart.actions.changeItem({ id, variant, qty, append: true }));
  });
}

async function main() {
  const store = makeStore(api);

  if (Cookies.get(experimentCookieName)) {
    setupButton(store);
  }

  window.store = store;
}

window.addEventListener("load", main);
