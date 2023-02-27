import { Op } from "sequelize";
import sequelize, { City } from "../../../lib/backend/deluxspa";
import get from "lodash/get";
import cors from "../../../lib/backend/cors";

export default async function (req, res) {
  await sequelize;

  const title = get(req, "query.title", "").trim();

  const suggestions = await City.findAll({
    where: {
      [Op.or]: [
        { city: { [Op.like]: `%${title}%` } },
        { region: { [Op.like]: `%${title}%` } },
      ],
    },
    limit: 10,
  });

  return res.status(200).json(suggestions);
}
