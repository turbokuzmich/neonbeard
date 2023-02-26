import dom from "react-dom/client";
import theme from "./theme";
import isNil from "lodash/isNil";
import api from "./api";
import React, { useCallback, useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Progress from "@mui/material/CircularProgress";
import { ThemeProvider } from "@mui/material/styles";
import { Provider, useSelector, useDispatch } from "react-redux";

// https://neon-beard.ru/order.html?o=3277-c5496ea3e308ab4c3844151313da188a83d173a3baea123d7751d5fdb03b1a48

const OrderState = {
  initial: "initial",
  fetching: "fetching",
  fetched: "fetched",
  failed: "failed",
};

function Order() {
  const [state, setState] = useState(OrderState.initial);

  useEffect(async () => {
    if (state === OrderState.initial) {
      try {
        const url = new URL(location.href);
        const token = url.searchParams.get("o");

        const order = await api.getOrder(token);
        console.log(order);
      } catch (_) {
        setState(OrderState.failed);
      }
    }
  }, [state, setState]);

  if (state === OrderState.initial || state === OrderState.fetching) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", clear: "both" }}>
        <Progress />
      </Box>
    );
  }

  if (state === OrderState.failed) {
    return (
      <Box sx={{ clear: "both" }}>
        <Typography>Не удалось получить информацию о заказе</Typography>
      </Box>
    );
  }

  return <div>Заказ</div>;
}

export default function (store) {
  dom.createRoot(document.getElementById("order-root")).render(
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <Order />
      </Provider>
    </ThemeProvider>
  );
}
