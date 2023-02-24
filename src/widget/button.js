import { ensureSetup } from "./helpers";
import { getOld, getUniversal } from "../../store/slices/catalog";
import cart from "../../store/slices/cart";
import get from "lodash/get";

export default ensureSetup(".product-action", function (store) {
  const oldId = document.querySelector("[name=shk-id]").value;
  const button = document.querySelector(".product-action button[type=submit]");

  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const state = store.getState();
    const universalId = get(getOld(state), oldId, "not_found");
    const item = get(getUniversal(state), universalId, null);

    const qty = parseInt(
      document.querySelector("[type=number][name=shk-count]").value
    );

    if (item) {
      const { id, variant } = item;

      store.dispatch(
        cart.actions.changeItem({ id, variant, qty, append: true })
      );
    }
  });
});
