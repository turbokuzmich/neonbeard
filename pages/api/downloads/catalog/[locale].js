import s3 from "../../../../lib/backend/aws";
import get from "lodash/get";
import last from "lodash/last";

export default async function downloadCatalog(req, res) {
  const locale = getLocale(req);

  const { Contents } = await s3
    .listObjects({
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: `catalog/neon-beard/${locale}`,
    })
    .promise();

  const { Key } = last(Contents);

  res.redirect(
    `https://${process.env.AWS_BUCKET_NAME}.storage.yandexcloud.net/${Key}`,
    301
  );
}

function getLocale(req) {
  const locale = get(req, ["query", "locale"], "ru");

  return ["en", "ru"].includes(locale) ? locale : "ru";
}
