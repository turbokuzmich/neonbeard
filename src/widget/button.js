import { getOld, getUniversal } from "../../store/slices/catalog";
import get from "lodash/get";
import dom from "react-dom/client";
import React, { useCallback } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { Provider, useSelector, useDispatch } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import { format } from "../../lib/helpers/numeral";
import decline from "../../lib/helpers/declension";
import cart, {
  stopTimer,
  startTimer,
  getNotification,
  getCartItemsCount,
  getCartSubtotal,
} from "../../store/slices/cart";

const notificationAnchor = {
  vertical: "bottom",
  horizontal: "center",
};

function Notification() {
  const dispatch = useDispatch();

  const total = useSelector(getCartSubtotal);
  const count = useSelector(getCartItemsCount);
  const notification = useSelector(getNotification);

  const handleClose = useCallback(
    () => dispatch(cart.actions.hideNotification()),
    [dispatch]
  );

  const onAlertOut = useCallback(() => dispatch(startTimer()), [dispatch]);
  const onAlertOver = useCallback(() => dispatch(stopTimer()), [dispatch]);

  return (
    <Snackbar
      open={notification}
      onClose={handleClose}
      autoHideDuration={6000}
      anchorOrigin={notificationAnchor}
    >
      <Alert
        severity="success"
        onClose={handleClose}
        onMouseLeave={onAlertOut}
        onMouseEnter={onAlertOver}
      >
        <AlertTitle>Товар добавлен в корзину</AlertTitle>
        <Typography paragraph>
          В корзине {count} {decline(count, ["товар", "товара", "товаров"])} на
          сумму {format(total)} ₽
        </Typography>
        <Button
          href="/cart.html"
          color="success"
          variant="contained"
          startIcon={<LocalShippingIcon />}
        >
          Купить
        </Button>
      </Alert>
    </Snackbar>
  );
}

export default function (store) {
  const notification = document.createElement("div");
  const oldId = document.querySelector("[name=shk-id]").value;
  const button = document.querySelector(".product-action button[type=submit]");

  document.documentElement.appendChild(notification);

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

  dom.createRoot(notification).render(
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <Notification />
      </Provider>
    </ThemeProvider>
  );
}
