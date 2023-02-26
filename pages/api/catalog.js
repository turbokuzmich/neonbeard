import axios from "axios";
import cors from "../../lib/backend/cors";
import { parse } from "../../lib/helpers/catalog";

export default cors(async function (_, res) {
  const { data } = await axios.get(`${process.env.SITE_URL}/widget.html`);

  res.status(200).json(parse(process.env.SITE_URL, data));
});
