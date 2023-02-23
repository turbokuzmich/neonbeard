import Cookies from "js-cookie";
import store from "../store";
import axios from "axios";

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

  const check = function () {
    return api.get("/check");
  };

  return { check };
})();

async function main() {}

window.addEventListener("load", main);
