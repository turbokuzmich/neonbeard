import fs from "fs";
import { Sequelize, Model, DataTypes } from "sequelize";
import { resolve, join } from "path";
import { orderStatuses } from "../../constants/orders";
import { getCachedCatalogItems } from "./old";
import { getUniversalId } from "../helpers/catalog";
import { DeliveryType } from "../../constants/delivery";
import { createHmac } from "crypto";
import set from "lodash/set";
import negate from "lodash/negate";
import isNil from "lodash/isNil";
import fromPairs from "lodash/fromPairs";
import property from "lodash/property";
import pick from "lodash/pick";

const isNotNil = negate(isNil);
const externalIdOffset = parseInt(process.env.ORDER_EXTERNAL_OFFSET, 10);

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

    const items = await this.getCartItems().then(function (items) {
      return items.map(function (item) {
        return item.sessionData;
      });
    });

    return { cookie, items };
  }
  async getCartTotal() {
    const [{ universal }, cartItems] = await Promise.all([
      await getCachedCatalogItems(),
      await this.getCartItems(),
    ]);

    return cartItems.reduce((total, item) => {
      const uid = getUniversalId({ id: item.itemId, variant: item.variantId });
      const price = universal[uid].price;

      return total + item.qty * price;
    }, 0);
  }
  async getOrderItemsData(forOrderId = 0) {
    const [{ universal }, cartItems] = await Promise.all([
      await getCachedCatalogItems(),
      await this.getCartItems(),
    ]);

    return cartItems.map(({ itemId, variantId, qty }) => {
      const uid = getUniversalId({ id: itemId, variant: variantId });
      const { title, volume, price } = universal[uid];

      return {
        OrderId: forOrderId,
        title: title,
        title_en: title,
        brief: title,
        brief_en: title,
        capacity: volume,
        capacity_en: volume,
        unit: volume,
        variant: variantId,
        price: price,
        qty: qty,
        total: qty * price,
      };
    });
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

export class CartItem extends Model {}

CartItem.init(
  {
    itemId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    variantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sessionData: {
      type: DataTypes.VIRTUAL,
      get() {
        const { itemId, variantId, qty } = this;

        return { itemId, variantId, qty };
      },
    },
  },
  { sequelize }
);

export class Order extends Model {
  async getOrderSize() {
    return (await this.getOrderItems()).length;
  }
  async getViewData() {
    const items = await this.getOrderItems();

    return { ...this.viewData, items: items.map(property("viewData")) };
  }
  validateHmac(hmac) {
    return this.hmac === hmac;
  }
  static getByExternalId(externalId) {
    const id = externalId - externalIdOffset;

    return Order.findByPk(id);
  }
}

Order.init(
  {
    key: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },
    paymentId: {
      type: DataTypes.STRING(36),
      unique: true,
    },
    type: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: Object.values(DeliveryType),
    },
    phone: {
      type: DataTypes.STRING(11),
      allowNull: false,
      validate: {
        isNumeric: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    comment: {
      type: DataTypes.STRING,
    },
    courierAddress: {
      type: DataTypes.STRING,
    },
    courierLat: {
      type: DataTypes.FLOAT,
    },
    courierLng: {
      type: DataTypes.FLOAT,
    },
    cdekCity: {
      type: DataTypes.INTEGER,
    },
    cdekPointTitle: {
      type: DataTypes.STRING,
    },
    cdekPointCode: {
      type: DataTypes.STRING,
    },
    cdekPointAddress: {
      type: DataTypes.STRING,
    },
    cdekPointLat: {
      type: DataTypes.FLOAT,
    },
    cdekPointLng: {
      type: DataTypes.FLOAT,
    },
    status: {
      type: DataTypes.ENUM,
      allowNull: false,
      defaultValue: "created",
      values: orderStatuses,
    },
    subtotal: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    delivery: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    hmac: {
      type: DataTypes.VIRTUAL,
      get() {
        return createHmac("sha256", process.env.KEY)
          .update(`${this.externalId}-${this.key}`)
          .digest("hex");
      },
    },
    externalId: {
      type: DataTypes.VIRTUAL,
      get() {
        return externalIdOffset + this.id;
      },
    },
    paymentPhone: {
      type: DataTypes.VIRTUAL,
      get() {
        return `7${this.phone}`;
      },
    },
    paymentData: {
      type: DataTypes.VIRTUAL,
      get() {
        const phone = ["phone", this.paymentPhone];
        const email = ["email", this.email];

        return fromPairs(
          [phone, email].filter(([_, value]) => isNotNil(value))
        );
      },
    },
    paymentReturnUrl: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${process.env.SITE_PAYMENT_RETURN_URL}?order=${this.externalId}&s=${this.hmac}`;
      },
    },
    infoUrl: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${process.env.SITE_URL}/order.html?o=${this.externalId}-${this.hmac}`;
      },
    },
    // viewData: {
    //   type: DataTypes.VIRTUAL,
    //   get() {
    //     return pick(this, [
    //       "address",
    //       "name",
    //       "total",
    //       "delivery",
    //       "status",
    //       "externalId",
    //     ]);
    //   },
    // },
  },
  { sequelize }
);

export class OrderItem extends Model {}

OrderItem.init(
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title_en: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    brief: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    brief_en: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    capacity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    capacity_en: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    variant: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.price * this.qty;
      },
    },
    viewData: {
      type: DataTypes.VIRTUAL,
      get() {
        return pick(this, [
          "title",
          "title_en",
          "brief",
          "brief_en",
          "capacity",
          "capacity_en",
          "unit",
          "variant",
          "qty",
          "price",
          "total",
        ]);
      },
    },
  },
  { sequelize }
);

Session.hasMany(CartItem);
CartItem.belongsTo(Session);

Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

export default process.env.NODE_ENV === "production"
  ? Promise.resolve(sequelize)
  : sequelize.sync();
