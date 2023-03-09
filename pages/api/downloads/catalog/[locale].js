import s3 from "../../../../lib/backend/s3";
import { sendDownload } from "../../../../lib/backend/queue";
import get from "lodash/get";
import last from "lodash/last";
import noop from "lodash/noop";

export default async function downloadCatalog(req, res) {
  const locale = getLocale(req);

  const { Contents } = await s3
    .listObjects({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Prefix: `catalog/neon-beard/${locale}`,
    })
    .promise();

  const { Key } = last(Contents);

  sendDownload(locale).then(noop).catch(noop);

  res.redirect(
    `https://${process.env.AWS_S3_BUCKET_NAME}.storage.yandexcloud.net/${Key}`,
    301
  );
}

function getLocale(req) {
  const locale = get(req, ["query", "locale"], "ru");

  return ["en", "ru"].includes(locale) ? locale : "ru";
}
