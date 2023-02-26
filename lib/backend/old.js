import axios from "axios";
import { parse } from "../helpers/catalog";

const cacheTime = 1 * 60 * 60 * 1000; // 1 hour

export const getCachedCatalogItems = (function () {
  let status = "initial"; // fetching | fetched
  let cachedAt = 0;
  let cached = null;
  let requests = [];

  return async function () {
    if (status === "fetching") {
      return new Promise((resolve) => {
        requests.push(resolve);
      });
    }

    if (status === "fetched" && Date.now() - cachedAt < cacheTime) {
      return Promise.resolve(cached);
    }

    status = "fetching";

    const { data } = await axios.get(`${process.env.SITE_URL}/widget.html`);

    cached = parse(process.env.SITE_URL, data);
    cachedAt = Date.now();

    status = "fetched";

    requests.forEach((resolve) => {
      resolve(cached);
    });

    requests = [];

    return cached;
  };
})();
