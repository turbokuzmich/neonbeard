import checkCORS from "nextjs-cors";

export default function withCORS(handler) {
  return async function (req, res) {
    await checkCORS(req, res, {
      origin: process.env.SITE_URL,
    });

    await handler(req, res);
  };
}
