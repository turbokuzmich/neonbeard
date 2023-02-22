import { nextCsrf } from "next-csrf";
import noop from "lodash/noop";

const { csrf, setup: setCsrf } = nextCsrf({
  secret: process.env.KEY,
  tokenKey: "neonbeard-csrf",
  cookieOptions: {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
  },
});

function setup(handler) {
  return async function (...args) {
    await setCsrf(noop)(...args);

    return handler(...args);
  };
}

export { csrf, setup };
