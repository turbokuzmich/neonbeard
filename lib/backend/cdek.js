import url from "url";
import get from "lodash/get";
import axios from "axios";

let tokenStatus = "initial"; // 'fetching' | 'set'
let tokenPromises = [];

export const api = axios.create({
  baseURL: process.env.CDEK_API_URL,
});

async function maybeSetToken(reset = false) {
  if (tokenStatus === "set" && reset === false) {
    return Promise.resolve();
  }

  if (tokenStatus === "fetching") {
    return new Promise((resolve) => {
      tokenPromises.push(resolve);
    });
  }

  tokenStatus = "fetching";

  const params = new url.URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.CDEK_CLIENT_ID,
    client_secret: process.env.CDEK_CLIENT_SECRET,
  });

  delete api.defaults.headers.common.Authorization;

  const { data } = await api.post(
    "/oauth/token?parameters",
    params.toString(),
    {
      headers: { "content-type": "application/x-www-form-urlencoded" },
    }
  );

  api.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;

  tokenStatus = "set";

  tokenPromises.forEach((resolve) => resolve());
  tokenPromises = [];
}

function ensureAuthorized(method) {
  return async function (...args) {
    await maybeSetToken();

    try {
      return await method(...args);
    } catch (error) {
      if (get(error, "response.status", 0) === 401) {
        await maybeSetToken(true);
        return await method(...args);
      }
    }
  };
}

export const calculate = ensureAuthorized(async function calculate(
  code,
  address,
  weight,
  total
) {
  // 1% — страховка
  // 3.5% — комиссия юмани
  const insurance_sum = Math.floor(total * 0.035);

  const { data } = await api.post("/calculator/tariff", {
    tariff_code: 368,
    packages: [{ weight }],
    to_location: { address, code },
    from_location: {
      code: process.env.CDEK_CODE,
      latitude: process.env.CDEK_LAT,
      longitude: process.env.CDEK_LNG,
      address: process.env.CDEK_ADDRESS,
    },
  });

  return { ...data, insurance_sum, total_sum: data.total_sum + insurance_sum };
});

export const regions = ensureAuthorized(async function regions(page = 0) {
  const { data } = await api.get("/location/regions", {
    params: {
      page,
      size: 500,
      country_codes: "ru",
    },
  });

  return data;
});

export const cities = ensureAuthorized(async function cities(page = 0) {
  const { data } = await api.get("/location/cities", {
    params: {
      page,
      size: 5000,
      country_codes: "ru",
    },
  });

  return data;
});

// FIXME это бы кешировать стоит на каое-то время
export const points = ensureAuthorized(async function deliveryPoints(city) {
  const { data } = await api.get("/deliverypoints", {
    params: {
      city_code: city,
      country_code: "ru",
    },
  });

  return data;
});
