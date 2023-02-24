import theme from "./theme";
import dom from "react-dom/client";
import React, { useMemo } from "react";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Price from "../../components/price";
import Image from "../../components/image";
import Progress from "@mui/material/CircularProgress";
import DeleteIcon from "@mui/icons-material/Delete";
import Typography from "@mui/material/Typography";
import NumericStepper from "../../components/numeric-stepper";
import { getUniversalId } from "../../lib/helpers/catalog";
import { ThemeProvider } from "@mui/material/styles";
import { Provider, useSelector, useDispatch } from "react-redux";

import {
  CatalogState,
  getState as getCatalogState,
  getUniversal,
} from "../../store/slices/catalog";

import cart, {
  CartState,
  getCartItems,
  getCartState,
  getCartSubtotal,
} from "../../store/slices/cart";

function Cart() {
  const dispatch = useDispatch();

  const items = useSelector(getCartItems);
  const universal = useSelector(getUniversal);
  const cartState = useSelector(getCartState);
  const subtotal = useSelector(getCartSubtotal);
  const catalogState = useSelector(getCatalogState);

  const onChanges = useMemo(
    () =>
      items.map(({ itemId, variantId, qty }) => ({
        del() {
          dispatch(
            cart.actions.changeItem({
              id: itemId,
              variant: variantId,
              qty: 0,
            })
          );
        },
        inc() {
          dispatch(
            cart.actions.changeItem({
              id: itemId,
              variant: variantId,
              qty: qty + 1,
            })
          );
        },
        dec() {
          if (qty > 1) {
            dispatch(
              cart.actions.changeItem({
                id: itemId,
                variant: variantId,
                qty: qty - 1,
              })
            );
          }
        },
      })),
    [items, dispatch]
  );

  if (
    [CatalogState.initial, CatalogState.fetching].includes(catalogState) ||
    [CartState.initial, CartState.fetching].includes(cartState)
  ) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", clear: "both" }}>
        <Progress />
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box sx={{ clear: "both" }}>
        <Typography variant="h6" paragraph>
          Корзина пуста
        </Typography>
        <Link href="/produkcziya.html">Перейти к покупкам</Link>
      </Box>
    );
  }

  return (
    <Box sx={{ clear: "both" }}>
      {cartState === CartState.fetched ? (
        <>
          <Box
            sx={{
              mb: 4,
              gap: 4,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {items.map(({ itemId, variantId, qty }, index) => {
              const uid = getUniversalId({ id: itemId, variant: variantId });
              const catalogItem = universal[uid];

              return (
                <Box
                  key={uid}
                  sx={{
                    gap: 4,
                    display: "flex",
                    alignItems: "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: 130,
                      flexGrow: 0,
                      flexShrink: 0,
                    }}
                  >
                    <Link sx={{ display: "block" }} href={catalogItem.url}>
                      <Image
                        src={catalogItem.image}
                        alt={catalogItem.title}
                        sx={{
                          maxWidth: "100%",
                          userSelect: "none",
                          display: "block",
                        }}
                      />
                    </Link>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexGrow: 1,
                      flexShrink: 1,
                      flexDirection: "column",
                      pt: 1,
                      pb: 1,
                    }}
                  >
                    <Link variant="h6" href={catalogItem.url} paragraph>
                      {catalogItem.title}
                    </Link>
                    <Typography>{catalogItem.volume}</Typography>
                  </Box>
                  <Box
                    sx={{
                      pt: 1,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <NumericStepper
                      value={qty}
                      inc={onChanges[index].inc}
                      dec={onChanges[index].dec}
                    />
                    <Button
                      onClick={onChanges[index].del}
                      variant="outlined"
                      color="secondary"
                      size="medium"
                      sx={{
                        ml: 2,
                        pl: 0,
                        pr: 0,
                        width: 42,
                        minWidth: 0,
                      }}
                    >
                      <DeleteIcon />
                    </Button>
                    <Typography
                      component="div"
                      variant="h6"
                      textAlign="right"
                      sx={{
                        minWidth: 120,
                      }}
                    >
                      <Price sum={qty * catalogItem.price} />
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Button size="large" variant="contained" color="success">
              Оформить доставку
            </Button>
            <Typography variant="h5">
              Итого: <Price sum={subtotal} />
            </Typography>
          </Box>
        </>
      ) : (
        <Typography>asd</Typography>
      )}
    </Box>
  );
}

export default function (store) {
  dom.createRoot(document.getElementById("cart-root")).render(
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <Cart />
      </Provider>
    </ThemeProvider>
  );
}
