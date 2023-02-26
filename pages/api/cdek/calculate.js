import get from "lodash/get";
import { calculate as calculateTariff } from "../../../lib/backend/cdek";

export default async function calculate(req, res) {
  const code = get(req, "query.code", null);

  if (code === null) {
    return res.status(200).json(null);
  }

  res.status(200).json(await calculateTariff(code));
}
