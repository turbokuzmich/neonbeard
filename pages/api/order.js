import cors from "../../lib/backend/cors";
import get from "lodash/get";
import property from "lodash/property";
import { Order } from "../../lib/backend/sequelize";

export default async function (req, res) {
  const token = get(req, ["query", "token"], "-");

  const parts = token.split("-");
  const externalId = get(parts, 0);
  const hmac = get(parts, 1);

  if (!(externalId && hmac)) {
    return res.status(404).json({});
  }

  const order = await Order.getByExternalId(externalId);

  if (!order || !order.validateHmac(hmac)) {
    return res.status(404).json({});
  }

  const items = await order.getOrderItems();

  res.status(200).json({
    order: {
      ...order.viewData,
      items: items.map(property("viewData")),
    },
  });
}
