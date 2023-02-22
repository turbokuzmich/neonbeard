import withSession from "../../lib/backend/session";
import { csrf } from "../../lib/backend/csrf";

export default csrf(async function (req, res) {
  if (req.method === "HEAD") {
    res.status(200).json({
      method: "head",
    });
  } else if (req.method === "POST") {
    res.status(200).json({
      method: "post",
    });
  } else {
    res.status(200).json({
      method: "get",
    });
  }
});
