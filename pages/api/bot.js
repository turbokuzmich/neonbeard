import get from "lodash/get";
import { verify } from "../../lib/helpers/bot";

export async function bot(req, res) {
  if (req.method === "POST") {
    const data = get(req, "body", {});

    console.log(data);

    return res.status(200).json({});
  }

  res.status(405).json({});
}
