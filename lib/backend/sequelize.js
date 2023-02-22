import fs from "fs";
import { Sequelize, Model, DataTypes } from "sequelize";
import { resolve, join } from "path";
import set from "lodash/set";
import omit from "lodash/omit";
import isNil from "lodash/isNil";

const timestampFieldNames = ["updatedAt", "createdAt"];

// FIXME move crm to secrets
const crt = fs
  .readFileSync(join(process.cwd(), ".mysql", "root.crt"))
  .toString();

const connectionParams =
  process.env.NODE_ENV === "production"
    ? {
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
      }
    : {
        logging: false,
        dialect: "sqlite",
        storage: resolve(process.cwd(), "site.db"),
      };

const sequelize = new Sequelize(connectionParams);

export class Session extends Model {
  async restoreSession() {
    const cookie = this.cookie;

    return { cookie };
  }
}

Session.init(
  {
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    httpOnly: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    domain: {
      type: DataTypes.STRING,
    },
    secure: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    sameSite: {
      type: DataTypes.ENUM,
      values: ["lax", "strict", "none", "true"],
    },
    maxAge: {
      type: DataTypes.INTEGER,
    },
    expires: {
      type: DataTypes.DATE,
    },
    touchedAt: {
      type: DataTypes.DATE,
    },
    cookie: {
      type: DataTypes.VIRTUAL,
      get() {
        return [
          "httpOnly",
          "path",
          "domain",
          "secure",
          "maxAge",
          "expires",
          "sameSite",
        ].reduce((cookie, key) => {
          const value = this[key];

          if (isNil(value)) {
            return cookie;
          }

          if (key === "sameSite") {
            return set(
              cookie,
              "sameSite",
              this.sameSite === "true" ? true : this.sameSite
            );
          }

          return set(cookie, key, value);
        }, {});
      },
      set(newCookie) {
        [
          "httpOnly",
          "path",
          "domain",
          "secure",
          "maxAge",
          "expires",
          "sameSite",
        ].forEach((key) => {
          if (isNil(newCookie[key])) {
            this[key] = null;
          } else if (key === "sameSite" && newCookie.sameSite === true) {
            this[key] = "true";
          } else {
            this[key] = newCookie[key];
          }
        });
      },
    },
  },
  { sequelize }
);

export default process.env.NODE_ENV === "production"
  ? Promise.resolve(sequelize)
  : sequelize.sync();
