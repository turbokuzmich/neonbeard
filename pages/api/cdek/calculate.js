import get from "lodash/get";
import { calculate as calculateTariff } from "../../../lib/backend/cdek";
import cors from "../../../lib/backend/cors";

export default cors(async function (req, res) {
  const code = get(req, "query.code", null);

  if (code === null) {
    return res.status(200).json(null);
  }

  res.status(200).json(await calculateTariff(code));
});
