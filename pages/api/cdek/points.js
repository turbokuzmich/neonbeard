import get from "lodash/get";
import cors from "../../../lib/backend/cors";
import { points as fetchPoints } from "../../../lib/backend/cdek";

export default async function (req, res) {
  const city = get(req, "query.city", null);

  if (city === null) {
    return res.status(200).json([]);
  }

  res.status(200).json(await fetchPoints(city));
}
