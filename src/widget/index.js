import Cookies from "js-cookie";
import api from "./api";
import makeStore from "../../store";
import setupButton from "./button";
import setupHeader from "./header";

function main() {
  const store = makeStore(api);

  if (Cookies.get("payment")) {
    setupButton(store);
    setupHeader(store);
  }

  window.store = store;
}

window.addEventListener("load", main);
