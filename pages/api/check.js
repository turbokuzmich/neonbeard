import { setup } from "../../lib/backend/csrf";
import cors from "../../lib/backend/cors";

const checkSession = setup(async function (req, res) {
  res.status(200).json({ message: "ok" });
});

export default async function (req, res) {
  if (req.method === "GET") {
    return checkSession(req, res);
  }

  res.status(405).json({ message: "Method not allowed" });
}
