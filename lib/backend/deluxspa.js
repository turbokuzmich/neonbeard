import fs from "fs";
import { Sequelize, Model, DataTypes } from "sequelize";
import { join } from "path";

// FIXME move crm to secrets
// const crt = fs
//   .readFileSync(join(process.cwd(), ".mysql", "root.crt"))
//   .toString();

const connectionParams = {
  logging: false,
  dialect: "mysql",
  host: process.env.MYSQL_HOST,
  port: 3306,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DELUXSPA_DB,
  // dialectOptions: {
  //   ssl: {
  //     rejectUnauthorized: true,
  //     ca: crt,
  //   },
  // },
};

const sequelize = new Sequelize(connectionParams);

export class City extends Model {}

City.init(
  {
    code: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: DataTypes.STRING,
    region: DataTypes.STRING,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
    confirmed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  { sequelize }
);

export default process.env.NODE_ENV === "production"
  ? Promise.resolve(sequelize)
  : sequelize.sync();
