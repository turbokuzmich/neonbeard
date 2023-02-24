import dom from "react-dom/client";
import React from "react";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Provider, useSelector } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import { getCartItemsCount } from "../../store/slices/cart";

function Header() {
  const count = useSelector(getCartItemsCount);

  return (
    <IconButton href="/cart.html">
      {count ? (
        <Badge badgeContent={count} color="success">
          <ShoppingCartIcon />
        </Badge>
      ) : (
        <ShoppingCartIcon />
      )}
    </IconButton>
  );
}

export default function (store) {
  dom.createRoot(document.querySelector(".header-cart-wrap")).render(
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <Header />
      </Provider>
    </ThemeProvider>
  );
}
