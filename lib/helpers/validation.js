import { string, number, object } from "yup";
import { DeliveryType } from "../../constants/delivery";
import constant from "lodash/constant";
import isNil from "lodash/isNil";
import isString from "lodash/isString";
import isNumber from "lodash/isNumber";
import isNaN from "lodash/isNaN";
import isFinite from "lodash/isFinite";

const errors = {
  type: "Пожалуйста, выберите способ доставки",
  phone: "Пожалуйста, укажите номер телефона",
  email: "Пожалуйста, укажите корректный адрес электронной почты",
  coordinate: "Пожалуйста, укажите координаты",
  cdekCity: "Пожалуйста, укажите город доставки СДЭК",
  cdekPointTitle: "Пожалуйста, укажите название пункта СДЭК",
  cdekPointCode: "Пожалуйста, укажите код пункта СДЭК",
  cdekPointAddress: "Пожалуйста, укажите адрес пункта СДЭК",
  cdekPointCoordinate: "Пожалуйста, укажите координаты пункта СДЭК",
};

const toUndefined = (value) => {
  if (isNil(value)) {
    return undefined;
  }
  if (isString(value)) {
    return value.length === 0 ? undefined : value;
  }
  if (isNumber(value)) {
    return isFinite(value) && !isNaN(value) ? value : undefined;
  }

  return value;
};

const type = string()
  .trim()
  .lowercase()
  .oneOf(Object.values(DeliveryType), errors.type)
  .required(errors.type);

const phone = string()
  .trim()
  .lowercase()
  .matches(/^\d+$/, errors.phone)
  .min(10, errors.phone)
  .max(14, errors.phone)
  .required(errors.phone);

const email = string()
  .optional()
  .nullable()
  .trim()
  .lowercase()
  .email(errors.email)
  .transform(toUndefined);

const comment = string().optional().nullable().trim().transform(toUndefined);

const courierAddress = string().when("type", ([type], schema) => {
  if (type === DeliveryType.courier) {
    return schema.optional().nullable().trim().transform(toUndefined);
  } else {
    return schema.transform(constant(undefined));
  }
});

const courierCoodinate = number()
  .typeError(errors.coordinate)
  .when("type", ([type], schema) => {
    if (type === DeliveryType.courier) {
      return schema
        .optional()
        .nullable()
        .transform(toUndefined)
        .min(-90, errors.coordinate)
        .max(90, errors.coordinate);
    } else {
      return schema.transform(constant(undefined));
    }
  });

const courierLat = courierCoodinate;
const courierLng = courierCoodinate;

const cdekCity = number()
  .typeError(errors.city)
  .when("type", ([type], schema) => {
    if (type === DeliveryType.cdek) {
      return schema
        .required(errors.city)
        .integer(errors.city)
        .positive(errors.city);
    } else {
      return schema.transform(constant(undefined));
    }
  });

const cdekPointTitle = string().when("type", ([type], schema) => {
  if (type === DeliveryType.cdek) {
    return schema.trim().required(errors.cdekPointTitle);
  } else {
    return schema.transform(constant(undefined));
  }
});

const cdekPointCode = string().when("type", ([type], schema) => {
  if (type === DeliveryType.cdek) {
    return schema.trim().required(errors.cdekPointCode);
  } else {
    return schema.transform(constant(undefined));
  }
});

const cdekPointAddress = string().when("type", ([type], schema) => {
  if (type === DeliveryType.cdek) {
    return schema.trim().required(errors.cdekPointAddress);
  } else {
    return schema.transform(constant(undefined));
  }
});

const cdekPointCoordinate = number()
  .typeError(errors.cdekPointCoordinate)
  .when("type", ([type], schema) => {
    if (type === DeliveryType.cdek) {
      return schema
        .required(errors.cdekPointCoordinate)
        .min(-90, errors.cdekPointCoordinate)
        .max(90, errors.cdekPointCoordinate);
    } else {
      return schema.transform(constant(undefined));
    }
  });

const cdekPointLat = cdekPointCoordinate;
const cdekPointLng = cdekPointCoordinate;

export const checkoutValidationSchema = object({
  type,
  phone,
  email,
  comment,
  courierAddress,
  courierLat,
  courierLng,
  cdekCity,
  cdekPointTitle,
  cdekPointCode,
  cdekPointAddress,
  cdekPointLat,
  cdekPointLng,
})
  .typeError("Пожалуйста, укажите детали доставки")
  .required("Пожалуйста, укажите детали доставки");
