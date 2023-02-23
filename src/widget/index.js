import Cookies from "js-cookie";
import makeStore from "../../store";
import axios from "axios";
import throttle from "lodash/throttle";
import get from "lodash/get";
import parse from "./parser";
import cart, { getCartItems, getCartItemsCount } from "../../store/slices/cart";
import { format } from "../../lib/helpers/numeral";

const apiRootUrl = "https://neonbeard.ru/api";
const siteUrl = "https://neon-beard.ru";
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
      .then((response) => get(response, ["data", "items"], []))
      .catch(() => []);
  });

  return { getCart, changeItem };
})();

async function getItemsData() {
  try {
    const { data } = await axios.get("https://neon-beard.ru/widget.html");

    return parse(siteUrl, data);
  } catch (_) {
    return {};
  }
}

function ensureSetup(selector, handler) {
  return function (...args) {
    if (document.querySelector(selector)) {
      handler(...args);
    }
  };
}

const setupButton = ensureSetup(".product-action", function (store, items) {
  const oldId = document.querySelector("[name=shk-id]").value;
  const button = document.querySelector(".product-action button[type=submit]");

  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const { id, variant } = items[oldId];
    const qty = parseInt(
      document.querySelector("[type=number][name=shk-count]").value
    );

    store.dispatch(cart.actions.changeItem({ id, variant, qty, append: true }));
  });
});

const setupHeader = ensureSetup(".header-cart-wrap", function (store, items) {
  const button = document.querySelector(".header-cart-toggle.shop-cart");
  const qty = button.querySelector(".number");
  const price = button.querySelector(".price");

  store.subscribe(function () {
    const state = store.getState();

    const total = getCartItems(state).reduce(
      (total, { itemId, variantId, qty }) =>
        total + items[itemId][variantId].price * qty,
      0
    );

    qty.innerHTML = getCartItemsCount(state);
    price.innerHTML = `${format(total)}&nbsp;₽`;
  });
});

async function main() {
  const items = await getItemsData();

  const store = makeStore(api);

  if (Cookies.get(experimentCookieName)) {
    setupButton(store, items);
    setupHeader(store, items);
  }

  window.store = store;
}

window.addEventListener("load", main);
