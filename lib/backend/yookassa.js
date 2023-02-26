import axios from "axios";
import { v4 as uuid } from "uuid";

const api = axios.create({
  baseURL: process.env.YOOKASSA_API_URL,
  auth: {
    username: process.env.YOOKASSA_SHOP_ID,
    password: process.env.YOOKASSA_SECRET_KEY,
  },
  header: {
    "content-type": "application/json",
  },
});

export async function createPayment(order) {
  const items = await order.getOrderItems();

  const {
    data: {
      id: paymentId,
      status,
      confirmation: { confirmation_url },
    },
  } = await api.post(
    "payments",
    {
      amount: {
        value: order.total.toFixed(2),
        currency: "RUB",
      },
      capture: true,
      confirmation: {
        type: "redirect",
        locale: "ru_RU",
        return_url: order.paymentReturnUrl,
      },
      metadata: {
        order: order.externalId,
        locale: "ru_RU",
      },
      receipt: {
        customer: order.paymentData,
        items: items
          .map(({ title, variant, price, qty }) => ({
            vat_code: 1,
            quantity: qty,
            description: `${title} (${variant})`,
            amount: {
              value: price.toFixed(2),
              currency: "RUB",
            },
          }))
          .concat({
            vat_code: 1,
            quantity: 1,
            description: "Доставка СДЭК",
            amount: {
              value: order.delivery.toFixed(2),
              currency: "RUB",
            },
          }),
      },
      description: `Заказ №${order.externalId}`,
    },
    {
      headers: {
        "idempotence-key": uuid(),
      },
    }
  );

  await order.update({ paymentId, status });

  return confirmation_url;
}

export async function getPayment(id) {
  return await api.get(`payments/${id}`, {
    headers: {
      "idempotence-key": uuid(),
    },
  });
}

export default api;
