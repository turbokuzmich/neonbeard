import withSession, { getSessionId } from "../../lib/backend/session";
import { createPayment } from "../../lib/backend/yookassa";
// import { sendNewOrderEmail } from "../../lib/backend/letters";
import { calculate } from "../../lib/backend/cdek";
// import { notifyOfNewOrder } from "../../lib/backend/bot";
import { csrf } from "../../lib/backend/csrf";
import { checkoutValidationSchema } from "../../lib/helpers/validation";
import cors from "../../lib/backend/cors";

import sequelize, {
  Order,
  OrderItem,
  Session,
  CartItem,
} from "../../lib/backend/sequelize";
import { DeliveryType } from "../../constants/delivery";

async function calculateCdek(orderData) {
  if (orderData.type === DeliveryType.courier) {
    return 0;
  }

  const { total_sum } = await calculate(
    orderData.cdekCity,
    orderData.cdekPointAddress
  );

  return total_sum;
}

async function doCheckout(req, res) {
  const db = await sequelize;

  const orderData = await checkoutValidationSchema.validate(req.body, {
    stripUnknown: true,
  });

  const id = getSessionId(req);

  if (id.isNone()) {
    return res.status(404).json({});
  }

  const session = await Session.findOne({
    where: { SessionId: id.unwrap() },
    include: [CartItem],
  });

  if (!session || session.CartItems.length === 0) {
    return res.status(404).json({});
  }

  const cartItems = session.CartItems;
  const orderTransaction = await db.transaction();

  try {
    const [delivery, subtotal] = await Promise.all([
      await calculateCdek(orderData),
      await session.getCartTotal(),
    ]);

    const order = await Order.create({
      ...orderData,
      subtotal,
      delivery,
      total: subtotal + delivery,
    });

    await OrderItem.bulkCreate(await session.getOrderItemsData(order.id));

    await orderTransaction.commit();

    // const url = await createPayment(order);

    // await Promise.all([sendNewOrderEmail(order), notifyOfNewOrder(order)]);

    res.status(200).json({ url });
  } catch (error) {
    console.log(error);
    await orderTransaction.rollback();

    return res.status(500).json({});
  }
}

async function finalizeCheckout(req, res) {
  const { s, order: id, locale = "ru" } = req.query;

  const order = await Order.getByExternalId(id);

  if (!order) {
    return res.status(404).json({});
  }

  if (!order.validateHmac(s)) {
    return res.status(400).json({});
  }

  await withSession(
    async function (session) {
      session.items = [];
    },
    req,
    res
  );

  res.redirect(order.infoUrl);
}

export default cors(
  csrf(async function (req, res) {
    if (req.method === "GET") {
      return finalizeCheckout(req, res);
    } else if (req.method === "POST") {
      return doCheckout(req, res);
    } else {
      res.status(405).json({});
    }
  })
);
