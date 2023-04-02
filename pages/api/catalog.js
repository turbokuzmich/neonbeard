import cors from "../../lib/backend/cors";
import { getCatalogItems } from "../../lib/backend/old";

export default async function (_, res) {
  res.status(200).json(await getCatalogItems());
}
