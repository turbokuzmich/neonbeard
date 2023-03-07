import aws from "aws-sdk";
import get from "lodash/get";
import property from "lodash/property";

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

export async function receive() {
  const result = await queue
    .receiveMessage({
      QueueUrl: process.env.AWS_QUEUE_URL,
      VisibilityTimeout: 0,
      WaitTimeSeconds: 0,
    })
    .promise();

  const messages = get(result, "Messages", []);
  const handles = messages.map(property("ReceiptHandle"));
  const bodies = messages.map((message) =>
    JSON.parse(get(message, "Body", {}))
  );

  await Promise.all(
    handles.map((handle) =>
      queue
        .deleteMessage({
          QueueUrl: process.env.AWS_QUEUE_URL,
          ReceiptHandle: handle,
        })
        .promise()
    )
  );

  return bodies;
}

export default queue;
