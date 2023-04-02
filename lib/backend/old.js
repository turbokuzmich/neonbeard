import axios from "axios";
import Cache from "node-cache";
import { parse } from "../helpers/catalog";
import { getNeonAssortment } from "./moysklad";

const key = "items";

const cache = new Cache({
  stdTTL: 60 * 60, // ttl 1 hour
  checkperiod: 10 * 60, // check every ten minutes
  deleteOnExpire: false,
});

cache.on("expired", async function (key, value) {
  cache.set(key, await getAssortment());
});

async function getAssortment() {
  const [store, { data }] = await Promise.all([
    getNeonAssortment(),
    axios.get(`${process.env.SITE_URL_PRODUCTION}/widget.html`),
  ]);

  return parse(process.env.SITE_URL_PRODUCTION, data, store);
}

export async function getCatalogItems() {
  if (cache.has(key)) {
    return cache.get(key);
  } else {
    const items = await getAssortment();

    cache.set(key, items);

    return items;
  }
}
