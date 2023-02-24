import React from "react";
import { NumericFormat } from "react-number-format";

export default function Price({ sum }) {
  return (
    <NumericFormat
      value={sum}
      displayType="text"
      thousandSeparator=" "
      suffix=" ₽"
    />
  );
}
