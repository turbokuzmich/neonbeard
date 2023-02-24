import React from "react";
import { NumericFormat } from "react-number-format";

export default function Number({ value }) {
  return (
    <NumericFormat value={value} displayType="text" thousandSeparator=" " />
  );
}
