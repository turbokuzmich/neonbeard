import Cookies from "js-cookie";
import api from "./api";
import makeStore from "../../store";

const store = makeStore(api);

if (Cookies.get("payment")) {
  if (document.querySelector(".header-cart-wrap")) {
    import("./header").then(function ({ default: setupHeader }) {
      setupHeader(store);
    });
  }
  if (document.querySelector(".product-action")) {
    import("./button").then(function ({ default: setupButton }) {
      setupButton(store);
    });
  }
  if (document.getElementById("cart-root")) {
    import("./cart").then(function ({ default: setupCart }) {
      setupCart(store);
    });
  }
}

window.store = store;
