import dom from "react-dom/client";
import theme from "./theme";
import Price from "../../components/price";
import api from "./api";
import React, { useMemo, useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Progress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import { ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import { DeliveryType } from "../../constants/delivery";

// https://neon-beard.ru/order.html?o=3277-c5496ea3e308ab4c3844151313da188a83d173a3baea123d7751d5fdb03b1a48

const OrderState = {
  initial: "initial",
  fetching: "fetching",
  fetched: "fetched",
  failed: "failed",
};

const OrderStatus = {
  created: "Создан",
  pending: "Ожидает оплаты",
  waiting_for_capture: "Ожидает оплаты",
  succeeded: "Собирается",
  canceled: "Отменен",
  preparing: "Готовится к отправке",
  shipping: "В пути",
  delivered: "Доставлен",
};

function Order() {
  const [state, setState] = useState(OrderState.initial);
  const [order, setOrder] = useState(null);

  const orderStatus = useMemo(() => {
    if (order) {
      return OrderStatus[order.status];
    } else {
      return "Неизвестен";
    }
  }, [order]);

  useEffect(() => {
    if (state === OrderState.initial) {
      Promise.resolve()
        .then(() => {
          const url = new URL(location.href);
          const token = url.searchParams.get("o");

          return api.getOrder(token);
        })
        .then((order) => {
          setOrder(order);
          setState(OrderState.fetched);
        })
        .catch(() => {
          setState(OrderState.failed);
        });
    }
  }, [state, setState, setOrder]);

  if (state === OrderState.initial || state === OrderState.fetching) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", clear: "both" }}>
        <Progress />
      </Box>
    );
  }

  if (state === OrderState.failed) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", clear: "both" }}>
        <Typography>Не удалось получить информацию о заказе</Typography>
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h4" paragraph>
        Номер
      </Typography>
      <Typography paragraph>{order.externalId}</Typography>
      <Typography variant="h4" paragraph>
        Статус заказа
      </Typography>
      <Typography paragraph>{orderStatus}</Typography>
      <Typography variant="h4" paragraph>
        Доставка
      </Typography>
      <Typography paragraph>
        {order.type === DeliveryType.cdek
          ? `В пункт выдачи СДЭК по адресу: ${order.address}`
          : null}
        {order.type === DeliveryType.courier
          ? `Курьером по адресу: ${order.address}`
          : null}
      </Typography>
      <Typography variant="h4" paragraph>
        Состав заказа
      </Typography>
      <TableContainer>
        <Table>
          <TableBody>
            {order.items.map((item) => (
              <TableRow key={`${item.title_en}-${item.capacity_en}`}>
                <TableCell sx={{ borderBottomColor: "#ffffff" }}>
                  <Typography variant="h6" component="div">
                    {item.title}, {item.capacity}
                  </Typography>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ verticalAlign: "bottom", borderBottomColor: "#ffffff" }}
                >
                  <Typography variant="h6" component="div">
                    {item.qty} x <Price sum={item.price} />
                  </Typography>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ verticalAlign: "bottom", borderBottomColor: "#ffffff" }}
                >
                  <Typography variant="h6" component="div">
                    <Price sum={item.total} />
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            {order.type === DeliveryType.cdek ? (
              <TableRow>
                <TableCell sx={{ borderBottomColor: "#ffffff" }}>
                  <Typography variant="h6" component="div">
                    Доставка
                  </Typography>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ verticalAlign: "bottom", borderBottomColor: "#ffffff" }}
                ></TableCell>
                <TableCell
                  align="right"
                  sx={{ verticalAlign: "bottom", borderBottomColor: "#ffffff" }}
                >
                  <Typography variant="h6" component="div">
                    <Price sum={order.delivery} />
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}
            <TableRow>
              <TableCell sx={{ borderBottom: "none" }}></TableCell>
              <TableCell sx={{ borderBottom: "none" }}></TableCell>
              <TableCell
                align="right"
                sx={{ verticalAlign: "bottom", borderBottom: "none" }}
              >
                <Typography variant="h5">
                  <Price sum={order.total} />
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
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
