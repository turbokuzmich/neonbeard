import get from "lodash/get";
import withSession from "../../lib/backend/session";
import { csrf } from "../../lib/backend/csrf";
import cors from "../../lib/backend/cors";

// TODO move
import "../../lib/backend/cron";

async function getCart(req, res) {
  await withSession(
    async function (session) {
      res.status(200).json({ items: get(session, "items", []) });
    },
    req,
    res
  );
}

// TODO validation
async function updateCart(req, res) {
  const session = await withSession(
    async function (session) {
      const { id, variant: variantStr, qty = 1, append = false } = req.body;
      const variant = parseInt(variantStr, 10);
      const items = get(session, "items", []);
      const itemsIndex = items.findIndex(
        ({ itemId, variantId }) => itemId === id && variantId === variant
      );

      if (itemsIndex > -1) {
        const currentQty = items[itemsIndex].qty;
        const newQty = append ? currentQty + qty : qty;

        if (newQty === 0) {
          session.items[itemsIndex].qty = 0;
          session.items.splice(itemsIndex, 1);
        } else {
          session.items[itemsIndex].qty = newQty;
        }
      } else {
        session.items.push({
          qty,
          itemId: id,
          variantId: variant,
        });
      }
    },
    req,
    res
  );

  res.status(200).json({ items: session.items });
}

export default csrf(async function (req, res) {
  if (req.method === "GET") {
    return getCart(req, res);
  } else if (req.method === "POST") {
    return updateCart(req, res);
  } else {
    res.status(405).json({});
  }
});
