import { nextCsrf } from "next-csrf";
import noop from "lodash/noop";
import defaulCookies from "../../constants/cookies";

const { csrf, setup: setCsrf } = nextCsrf({
  secret: process.env.KEY,
  tokenKey: "neonbeard-csrf",
  cookieOptions: defaulCookies,
});

function setup(handler) {
  return async function (...args) {
    await setCsrf(noop)(...args);

    return handler(...args);
  };
}

export { csrf, setup };
