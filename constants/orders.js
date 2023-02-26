export const orderStatuses = [
  "created", // только что был создан, еще нет транзакции на оплату
  "pending", // ожидает оплаты от платежного гейта
  "waiting_for_capture", // пока не используется
  "succeeded", // оплачен
  "canceled", // отменен
  "preparing", // после оплаты готовится к отправке
  "shipping", // передан в транспортную компанию
  "delivered", // доставлен
];
