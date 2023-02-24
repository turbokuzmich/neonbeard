import dom from "react-dom/client";
import React, { useCallback } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { Provider, useSelector, useDispatch } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import { ensureSetup } from "./helpers";
import { format } from "../../lib/helpers/numeral";
import decline from "../../lib/helpers/declension";
import cart, {
  getNotification,
  getCartItemsCount,
  getCartSubtotal,
} from "../../store/slices/cart";

const containerSelector = ".header-cart-wrap";

function Header() {
  const dispatch = useDispatch();

  const total = useSelector(getCartSubtotal);
  const count = useSelector(getCartItemsCount);
  const notification = useSelector(getNotification);

  const handleClose = useCallback(
    () => dispatch(cart.actions.hideNotification()),
    [dispatch]
  );

  return (
    <>
      <IconButton>
        {count ? (
          <Badge badgeContent={count} color="success">
            <ShoppingCartIcon />
          </Badge>
        ) : (
          <ShoppingCartIcon />
        )}
      </IconButton>
      <Snackbar
        open={notification}
        onClose={handleClose}
        autoHideDuration={6000}
      >
        <Alert severity="success" onClose={handleClose}>
          <AlertTitle>Товар добавлен в корзину</AlertTitle>
          <Box>
            <Typography paragraph>
              В корзине {count} {decline(count, ["товар", "товара", "товаров"])}{" "}
              на сумму {format(total)} ₽.
            </Typography>
            <Button size="small" color="success" variant="outlined">
              Оформить доставку
            </Button>
          </Box>
        </Alert>
      </Snackbar>
    </>
  );
}

export default ensureSetup(containerSelector, function (store) {
  dom.createRoot(document.querySelector(containerSelector)).render(
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <Header />
      </Provider>
    </ThemeProvider>
  );
});
