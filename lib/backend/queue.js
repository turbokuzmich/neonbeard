import aws from "aws-sdk";
import pick from "lodash/pick";
import { format } from "../helpers/numeral";

const queue = new aws.SQS({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_QUEUE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function send(message) {
  const result = await queue
    .sendMessage({
      QueueUrl: process.env.AWS_QUEUE_URL,
      DelaySeconds: 0,
      MessageBody: JSON.stringify(message),
    })
    .promise();

  return result;
}

export async function sendOrder(order) {
  await send({
    type: "neon-beard-new-order",
    order: pick(order, ["id", "phone", "email", "total"]),
  });
}

export async function sendDownload(locale) {
  await send({
    locale,
    type: "neon-beard-download",
  });
}

export default queue;
