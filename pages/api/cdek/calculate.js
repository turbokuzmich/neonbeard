import get from "lodash/get";
import { getSessionId } from "../../../lib/backend/session";
import { Session, CartItem } from "../../../lib/backend/sequelize";
import { calculate as calculateTariff } from "../../../lib/backend/cdek";

export default async function (req, res) {
  const code = get(req, "query.code", null);
  const address = get(req, "query.address", null);

  if (code === null || address === null) {
    return res.status(200).json({ calculated: false });
  }

  const id = getSessionId(req);

  if (id.isNone()) {
    return res.status(200).json({ calculated: false });
  }

  const session = await Session.findOne({
    where: { SessionId: id.unwrap() },
    include: [CartItem],
  });

  if (!session || session.CartItems.length === 0) {
    return res.status(200).json({ calculated: false });
  }

  try {
    const [subtotal, weight] = await Promise.all([
      await session.getCartTotal(),
      await session.getCartWeight(),
    ]);

    const result = await calculateTariff(code, address, weight, subtotal);

    return res.status(200).json({ ...result, calculated: true });
  } catch (_) {
    return res.status(200).json({ calculated: false });
  }
}
