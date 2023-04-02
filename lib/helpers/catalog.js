import get from "lodash/get";

export const itemsProcessors = [
  [
    /супер‑очищающий гель‑шампунь 3 в 1/,
    {
      id(title) {
        return `super_cleansing_gel_${title
          .trim()
          .toLowerCase()
          .match(/^(.+)\sneon/)[1]
          .trim()}_neon`;
      },
      variant(str) {
        return parseInt(str.trim().match(/\d+/)[0], 10);
      },
    },
  ],
  [
    /скраб для лица/,
    {
      id(title) {
        return `facial_scrub_${title
          .trim()
          .toLowerCase()
          .match(/^(.+)скраб для лица/)[1]
          .trim()
          .replace(/\s+/g, "_")}`;
      },
      variant(str) {
        return parseInt(str.trim().match(/\d+/)[0], 10);
      },
    },
  ],
  [
    /масло для лица и бороды/,
    {
      id(title) {
        return `dry_oil_${title
          .trim()
          .toLowerCase()
          .match(/^(.+)масло для лица и бороды/)[1]
          .trim()
          .replace(/\s+/g, "_")}`;
      },
      variant(str) {
        return parseInt(str.trim().match(/\d+/)[0], 10);
      },
    },
  ],
  [
    /масло‑пластилин/,
    {
      id(title) {
        return `oil_plasticine_${title
          .trim()
          .toLowerCase()
          .match(/^(.+)масло‑пластилин/)[1]
          .trim()
          .replace(/\s+/g, "_")}`;
      },
      variant(str) {
        return parseInt(str.trim().match(/\d+/)[0], 10);
      },
    },
  ],
  [
    /сухое пластичное масло/,
    {
      id(title) {
        return `dry_oil_plasticine_${title
          .trim()
          .toLowerCase()
          .match(/^(.+)сухое пластичное масло/)[1]
          .trim()
          .replace(/\s+/g, "_")}`;
      },
      variant(str) {
        return parseInt(str.trim().match(/\d+/)[0], 10);
      },
    },
  ],
  [
    /альгинатная маска/,
    {
      id(title) {
        return `alginate_mask_${title
          .trim()
          .toLowerCase()
          .match(/^(.+)альгинатная маска/)[1]
          .trim()
          .replace(/\s+/g, "_")}`;
      },
      variant(str) {
        return parseInt(str.trim().match(/\d+/)[0], 10);
      },
    },
  ],
  [
    /гиалуроновый крем/,
    {
      id(title) {
        return `hyaluronic_cream_${title
          .trim()
          .toLowerCase()
          .match(/^(.+)гиалуроновый крем/)[1]
          .trim()
          .replace(/\s+/g, "_")}`;
      },
      variant(str) {
        return parseInt(str.trim().match(/\d+/)[0], 10);
      },
    },
  ],
  [
    /Увлажняющий гель гиалуроновой кислоты с витамином C/,
    {
      id() {
        return "moisturizing_gel";
      },
      variant(str) {
        return parseInt(str.trim().match(/\d+/)[0], 10);
      },
    },
  ],
  [
    /Пластиковая подарочная карта/,
    {
      id() {
        return "gift_card";
      },
      variant(_, str) {
        return parseInt(str.trim().toLowerCase().match(/\d+/)[0], 10);
      },
    },
  ],
  [
    /Подарочный набор/,
    {
      id() {
        return "gift_set";
      },
      variant() {
        return 1;
      },
    },
  ],
  [
    /Футболка Neon Beard/,
    {
      id() {
        return "t_shirt";
      },
      variant() {
        return 1;
      },
    },
  ],
  [
    /шампунь для волос/,
    {
      id(title) {
        return `shampoo_${title
          .trim()
          .toLowerCase()
          .match(/^(.+)шампунь для волос/)[1]
          .trim()
          .replace(/\s+/g, "_")}`;
      },
      variant(str) {
        return parseInt(str.trim().match(/\d+/)[0], 10);
      },
    },
  ],
];

export function parse(siteUrl, data, store) {
  const storeByExternalId = store.reduce(
    (byId, item) => ({ ...byId, [item.id]: item }),
    {}
  );

  return data
    .trim()
    .split("---")
    .filter(Boolean)
    .map((data) => data.trim().split("\n"))
    .map(
      ([
        idStr,
        titleStr,
        uri,
        image,
        priceStr,
        variantStr,
        weightStr,
        externalId,
      ]) => {
        const [, { id, variant }] = itemsProcessors.find(([titleRegExp]) =>
          titleRegExp.test(titleStr)
        );

        const storeItem = storeByExternalId[externalId];
        const price = storeItem ? storeItem.price : parseInt(priceStr, 10);
        const balance = storeItem ? storeItem.balance : 1;

        return {
          price,
          balance,
          old: idStr,
          id: id(titleStr),
          volume: variantStr,
          title: titleStr,
          url: `${siteUrl}/${uri}`,
          image: `${siteUrl}/${image}`,
          weight: parseInt(weightStr, 10),
          variant: variant(variantStr, titleStr),
        };
      }
    )
    .reduce(
      (items, item) => {
        const uid = getUniversalId(item);

        return {
          list: [...items.list, uid],
          old: { ...items.old, [item.old]: uid },
          universal: { ...items.universal, [uid]: item },
          id: { ...items.id, [item.id]: [...get(items.id, item.id, []), uid] },
        };
      },
      { id: [], old: {}, list: [], universal: {} }
    );
}

export function getUniversalId({ id, variant }) {
  return `${id}_${variant}`;
}
