import get from "lodash/get";
import isObject from "lodash/isObject";
import { createHmac } from "crypto";

const secretKey = createHmac("sha256", "WebAppData")
  .update(process.env.TELEGRAM_API_TOKEN)
  .digest();

export function verify(input) {
  const hashToCheck = get(input, "hash", "");

  const data = Object.keys(input)
    .filter((key) => key !== "hash")
    .sort()
    .map((key) =>
      isObject(input[key])
        ? `${key}=${JSON.stringify(input[key])}`
        : `${key}=${input[key]}`
    )
    .join("\n");

  const hash = createHmac("sha256", secretKey).update(data).digest("hex");

  return hash === hashToCheck;
}

export function sign(input) {
  const data = Object.keys(input)
    .sort()
    .map((key) =>
      isObject(input[key])
        ? `${key}=${JSON.stringify(input[key])}`
        : `${key}=${input[key]}`
    )
    .join("\n");

  const hash = createHmac("sha256", secretKey).update(data).digest("hex");

  return { ...input, hash };
}
