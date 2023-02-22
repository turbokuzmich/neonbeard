import runWithSession, { runIfHasSession } from "../../lib/backend/session";
import { csrf, setup } from "../../lib/backend/csrf";
import withCORS from "../../lib/backend/cors";

const checkSession = setup(async function (req, res) {
  await runIfHasSession(
    async function (session) {
      res.status(200).json({
        session: session.touchedAt,
      });
    },
    async function () {
      res.status(200).json({
        session: false,
      });
    },
    req,
    res
  );
});

async function updateSession(req, res) {
  const session = await runWithSession(
    async function (session) {
      session.obanze = "true";
    },
    req,
    res
  );

  res.status(200).json({
    session: session.touchedAt,
  });
}

export default withCORS(
  csrf(async function (req, res) {
    if (req.method === "POST") {
      return updateSession(req, res);
    } else if (req.method === "GET") {
      return checkSession(req, res);
    }
  })
);
