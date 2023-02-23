import numeral from "numeral";

if (!numeral.locales["ru"]) {
  numeral.register("locale", "ru", {
    delimiters: {
      thousands: " ",
      decimal: ",",
    },
    abbreviations: {
      thousand: "тыс.",
      million: "млн.",
      billion: "млрд.",
      trillion: "трлн.",
    },
    ordinal() {
      return ".";
    },
    currency: {
      symbol: "₽",
    },
  });

  numeral.locale("ru");
}

/**
 *
 * @param {number} number
 * @returns {String}
 */
export function format(number) {
  return numeral(number).format("0,0");
}

export default numeral;
