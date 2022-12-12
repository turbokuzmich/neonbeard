import fs from "fs";
import path from "path";
import { Sequelize } from "sequelize";
import { models } from "@next-auth/sequelize-adapter";

// FIXME move crm to secrets
const crt = fs
  .readFileSync(path.join(process.cwd(), ".mysql", "root.crt"))
  .toString();

const connectionParams = {
  logging: false,
  dialect: "mysql",
  host: process.env.MYSQL_HOST,
  port: 3306,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB,
  dialectOptions: {
    ssl: {
      rejectUnauthorized: true,
      ca: crt,
    },
  },
};

const sequelize = new Sequelize(connectionParams);

export const User = sequelize.define("User", {
  ...models.User,
});

// sequelize.sync();

export default sequelize;
