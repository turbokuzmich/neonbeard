import cookie from "cookie";
import get from "lodash/get";
import curry from "lodash/curry";
import first from "lodash/first";
import take from "lodash/take";
import pick from "lodash/pick";
import isNumber from "lodash/isNumber";
import isString from "lodash/isString";
import { v4 as uuid } from "uuid";
import { sign, unsign } from "cookie-signature";
import { Some, None } from "@sniptt/monads";
import sequelize, { Session, CartItem } from "./sequelize";
import { enablePatches, produceWithPatches } from "immer";
import defaultCookies from "../../constants/cookies";

enablePatches();

const requestSessionSymbol = Symbol("session");

const cookieName = "neonbeard-session";

const defaultSession = {
  cookie: defaultCookies,
  items: [],
};

const SomeDefaultSession = Some(defaultSession);

function commitHeader(res, session) {
  const response = Some(res).andThen(function (res) {
    return res.headersSent ? None : Some(res);
  });

  const previousCookie = response.map((res) => res.getHeader("set-cookie"));

  const cookieString = response.map(() =>
    cookie.serialize(cookieName, sign(session.id, process.env.KEY), {
      ...session.cookie,
    })
  );

  cookieString
    .andThen(function (cookieString) {
      return previousCookie
        .map(function (previousCookie) {
          return Array.isArray(previousCookie)
            ? [...previousCookie, cookieString]
            : [previousCookie, cookieString];
        })
        .or(Some(cookieString));
    })
    .match({
      none() {
        return res;
      },
      some(cookie) {
        return res.setHeader("set-cookie", cookie);
      },
    });
}

async function saveSession(prevSession, newSession, patches) {
  const storedSession = await upsertSession(newSession);

  let processItemsUpdates = true;
  let skipReplacesUntilLength = false;

  if (newSession.items.length === 0) {
    await CartItem.destroy({
      where: {
        SessionId: storedSession.id,
      },
    });

    processItemsUpdates = false;
  }

  for (const { op, path, value } of patches) {
    const branch = first(path);

    if (branch === "items" && processItemsUpdates) {
      if (op === "add") {
        await CartItem.create({ ...value, SessionId: storedSession.id });
      }
      if (op === "replace") {
        if (path.length === 3 && isNumber(path[1]) && isString(path[2])) {
          const itemPath = take(path, 2);
          const item = get(newSession, itemPath);
          const property = get(path, 2);

          const record = await CartItem.findOne({
            where: {
              SessionId: storedSession.id,
              ...pick(item, ["itemId", "variantId"]),
            },
          });

          if (record) {
            await record.update({ [property]: value });
          }
        }
        if (
          path.length === 2 &&
          isNumber(path[1]) &&
          get(prevSession, ["items", path[1] + 1]) ===
            get(newSession, ["items", path[1]]) &&
          !skipReplacesUntilLength
        ) {
          const item = await CartItem.findOne({
            where: {
              SessionId: storedSession.id,
              ...pick(get(prevSession, ["items", path[1]]), [
                "itemId",
                "variantId",
              ]),
            },
          });

          if (item) {
            await item.destroy();
          }

          skipReplacesUntilLength = true;
        }
        if (
          path.length === 2 &&
          path[1] === "length" &&
          skipReplacesUntilLength
        ) {
          skipReplacesUntilLength = false;
        }
      }
    }
  }
}

export const runIfHasSession = curry(async function runIfHasSession(
  handler,
  fallback,
  req,
  res
) {
  const maybeSession = await maybeGetSession(req);

  await maybeSession.match({
    async none() {
      await fallback();
    },
    async some(session) {
      const [nextSession, patches] = await produceWithPatches(session, handler);

      if (nextSession === session) {
        return session;
      }

      commitHeader(res, nextSession);

      await saveSession(session, nextSession, patches);

      req[requestSessionSymbol] = nextSession;

      return nextSession;
    },
  });
});

export default curry(async function runWithSession(handler, req, res) {
  const session = await getSession(req);

  const [nextSession, patches] = await produceWithPatches(session, handler);

  if (nextSession === session) {
    return session;
  }

  commitHeader(res, nextSession);

  await saveSession(session, nextSession, patches);

  req[requestSessionSymbol] = nextSession;

  return nextSession;
});

export async function maybeGetSession(req) {
  if (req[requestSessionSymbol]) {
    return Some(req[requestSessionSymbol]);
  }

  return await getSessionId(req).match({
    none: Promise.resolve(None),
    some(sessionId) {
      return getRestoredSession(sessionId).then((maybeSession) =>
        maybeSession.map((session) => ({ ...session, id: sessionId }))
      );
    },
  });
}

export async function getSession(req) {
  if (req[requestSessionSymbol]) {
    return req[requestSessionSymbol];
  }

  const sessionId = getSessionId(req);
  const restoredSession = await getRestoredOrNewSession(sessionId);

  const session = restoredSession
    .andThen(function (restoredSession) {
      return sessionId.or(Some(uuid())).map(function (id) {
        return { id, ...restoredSession };
      });
    })
    .match({
      none: {},
      some(session) {
        return session;
      },
    });

  req[requestSessionSymbol] = session;

  return session;
}
// return {
//   ...session,
//   clearRequest() {
//     delete req[requestSessionSymbol];
//   },
//   commitHeader() {
//     const response = Some(res).andThen(function (res) {
//       return res.headersSent ? None : Some(res);
//     });

//     const previousCookie = response.map((res) =>
//       res.getHeader("set-cookie")
//     );

//     const cookieString = response.map(() =>
//       cookie.serialize(cookieName, sign(this.id, process.env.KEY), {
//         ...this.cookie,
//       })
//     );

//     cookieString
//       .andThen(function (cookieString) {
//         return previousCookie
//           .map(function (previousCookie) {
//             return Array.isArray(previousCookie)
//               ? [...previousCookie, cookieString]
//               : [previousCookie, cookieString];
//           })
//           .or(Some(cookieString));
//       })
//       .match({
//         none() {
//           return res;
//         },
//         some(cookie) {
//           return res.setHeader("set-cookie", cookie);
//         },
//       });
//   },
//   async commit() {
//     this.commitHeader();

//     // store sesssion
//   },
//   touch() {
//     // store session if not yet
//     // update touchedAt column
//   },
//   async destroy() {
//     // remove from store

//     this.commitHeader();
//     this.clearRequest();
//   },
// };

async function upsertSession(session) {
  await sequelize;

  const existingSession = await Session.findOne({
    where: { sessionId: session.id },
  });

  if (existingSession) {
    existingSession.cookie = session.cookie;
    existingSession.touchedAt = new Date();

    await existingSession.save();

    return existingSession;
  } else {
    const newSession = new Session();

    newSession.sessionId = session.id;
    newSession.cookie = session.cookie;

    await newSession.save();

    return newSession;
  }
}

async function getRestoredSession(sessionId) {
  await sequelize;

  const dbSession = await Session.findOne({ where: { sessionId } });

  if (dbSession === null) {
    return None;
  }

  const restoredSession = await dbSession.restoreSession();

  return Some(restoredSession);
}

function getRestoredOrNewSession(sessionId) {
  return sessionId.match({
    none: Promise.resolve(SomeDefaultSession),
    async some(sessionId) {
      const maybeRestoredSession = await getRestoredSession(sessionId);

      return maybeRestoredSession.or(SomeDefaultSession);
    },
  });
}

export function getSessionId(req) {
  const parsedCookie = cookie.parse(get(req, ["headers", "cookie"], ""));
  const sessionIdCookie = get(parsedCookie, cookieName, null);

  if (sessionIdCookie === null) {
    return None;
  }

  const decoded = unsign(sessionIdCookie, process.env.KEY);

  return decoded ? Some(decoded) : None;
}
