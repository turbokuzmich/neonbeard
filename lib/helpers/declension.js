/**
 * Сколняет существительные
 *
 * @example decline(1, ['минута', 'минуты', 'минут'])
 *
 * @param {number} count
 * @param {[string, string, string]} forms
 * @param {'ru'|'en'} locale
 * @returns {string}
 */
export default function decline(count, forms, locale = "ru") {
  if (locale === "en") {
    return count === 0 || count > 1 ? forms[1] : forms[0];
  }

  const num = Math.abs(count) % 100;
  const tenReminder = num % 10;

  if (num > 10 && num < 20) {
    return forms[2];
  }

  if (tenReminder > 1 && tenReminder < 5) {
    return forms[1];
  }

  if (tenReminder == 1) {
    return forms[0];
  }

  return forms[2];
}
