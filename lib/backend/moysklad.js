import memoize from "lodash/memoize";
import { resolve } from "path";
import { load } from "@grpc/proto-loader";
import { credentials, loadPackageDefinition } from "@grpc/grpc-js";

const getClient = memoize(async () => {
  const protos = await load(
    resolve(process.cwd(), "lib", "protos", "moysklad.proto")
  );

  const definitions = loadPackageDefinition(protos);

  return new definitions.MoySklad(
    `${process.env.MOY_SKLAD_ADDRESS}:${process.env.MOY_SKLAD_PORT}`,
    credentials.createInsecure()
  );
});

async function streamToArray(stream) {
  const data = [];

  for await (const item of stream) {
    data.push(item);
  }

  return data;
}

export async function getNeonAssortment() {
  const client = await getClient();

  return streamToArray(client.getNeonAssortment());
}
