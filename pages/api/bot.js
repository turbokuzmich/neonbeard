import get from "lodash/get";
import { verify } from "../../lib/helpers/bot";
import { Order, OrderItem } from "../../lib/backend/sequelize";

const commands = {
  async listOrders(_, res, data) {
    const id = get(data, "id", 0);
    const orders = await Order.suggestById(id);

    return res.status(200).json(orders.map((order) => order.toJSON()));
  },
  async viewOrder(_, res, data) {
    const id = parseInt(get(data, "id", 0), 10);
    const order = await Order.findByPk(id, {
      include: [OrderItem],
    });

    if (order) {
      res.status(200).json(order.toJSON());
    } else {
      res.status(404).json({});
    }
  },
};

export default async function bot(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({});
  }

  const data = get(req, "body", {});

  if (!verify(data)) {
    return res.status(403).json({});
  }

  const command = get(data, "command");

  if (!(command in commands)) {
    return res.status(400).json({});
  }

  await commands[command](req, res, data);
}
