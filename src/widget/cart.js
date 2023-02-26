import theme from "./theme";
import dom from "react-dom/client";
import decline from "../../lib/helpers/declension";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Price from "../../components/price";
import Image from "../../components/image";
import Number from "../../components/number";
import Progress from "@mui/material/CircularProgress";
import DeleteIcon from "@mui/icons-material/Delete";
import Typography from "@mui/material/Typography";
import NumericStepper from "../../components/numeric-stepper";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { Formik, Form, Field, useField, useFormikContext } from "formik";
import { TextField as TextInput } from "formik-mui";
import { PatternFormat } from "react-number-format";
import { checkoutValidationSchema } from "../../lib/helpers/validation";
import { getUniversalId } from "../../lib/helpers/catalog";
import { ThemeProvider } from "@mui/material/styles";
import { Provider, useSelector, useDispatch } from "react-redux";
import { phoneFormat } from "../../constants/contacts";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import identity from "lodash/identity";

import {
  CatalogState,
  getState as getCatalogState,
  getUniversal,
} from "../../store/slices/catalog";

import cart, {
  CartState,
  getCartItems,
  getCartItemsCount,
  getCartState,
  getCartSubtotal,
} from "../../store/slices/cart";

import delivery, {
  getCdekCity,
  getCdekCitySuggestions,
  getDeliveryFormValues,
} from "../../store/slices/delivery";

function Cart() {
  const dispatch = useDispatch();

  const map = useRef();
  const phoneFieldRef = useRef();
  const mapsContainerRef = useRef();

  const items = useSelector(getCartItems);
  const universal = useSelector(getUniversal);
  const cartState = useSelector(getCartState);
  const count = useSelector(getCartItemsCount);
  const subtotal = useSelector(getCartSubtotal);
  const catalogState = useSelector(getCatalogState);
  const formValues = useSelector(getDeliveryFormValues);
  const cdekCity = useSelector(getCdekCity);
  const cdekCitySuggestions = useSelector(getCdekCitySuggestions);

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

  const toItems = useCallback(
    () => dispatch(cart.actions.toItems()),
    [dispatch]
  );

  const toDelivery = useCallback(
    () => dispatch(cart.actions.toDelivery()),
    [dispatch]
  );

  const toPayment = useCallback(
    () => dispatch(cart.actions.toPayment()),
    [dispatch]
  );

  const onCdekCityTitleInputChange = useCallback(
    (_, newInput) =>
      dispatch(delivery.actions.changeCdekCityTitleInput(newInput)),
    [dispatch]
  );

  const onCdekCitySelected = useCallback(
    (_, option) =>
      dispatch(delivery.actions.setCdekCity(option ? option : null)),
    [dispatch]
  );

  const isOptionEqualToValue = useCallback((cityA, cityB) => {
    return cityA.code === cityB.code;
  }, []);

  useEffect(() => {
    ymaps.ready(() => {
      dispatch(delivery.actions.apiLoaded());
    });
  }, [dispatch]);

  useEffect(() => {
    if (cartState === CartState.delivery && phoneFieldRef.current) {
      phoneFieldRef.current.focus();
    }
  }, [cartState]);

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

  if (count === 0) {
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
    <>
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
              <Button size="large" variant="outlined" onClick={toDelivery}>
                Оформить доставку
              </Button>
              <Typography variant="h5">
                Итого: <Price sum={subtotal} />
              </Typography>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              mb: 4,
              gap: 2,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography variant="h4" sx={{ flexGrow: 1 }}>
              Товары
            </Typography>
            <Typography variant="h6">
              <Number value={count} />{" "}
              {decline(count, ["товар", "товара", "товаров"])} на сумму{" "}
              <Price sum={subtotal} />
            </Typography>
            <Button variant="outlined" size="medium" onClick={toItems}>
              Изменить
            </Button>
          </Box>
        )}
        {cartState === CartState.delivery ? (
          <Formik
            initialValues={formValues}
            onSubmit={toPayment}
            validationSchema={checkoutValidationSchema}
            enableReinitialize
            validateOnMount
          >
            <Form>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  mb: 4,
                }}
              >
                <Typography variant="h4" sx={{ flexGrow: 1 }}>
                  Доставка
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  mb: 2,
                }}
              >
                <PhoneInput inputRef={phoneFieldRef} />
                <Field
                  component={TextInput}
                  label="Адрес электронной почты"
                  autoComplete="off"
                  name="email"
                  fullWidth
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Autocomplete
                  disablePortal
                  autoComplete
                  value={cdekCity}
                  filterOptions={identity}
                  onInputChange={onCdekCityTitleInputChange}
                  onChange={onCdekCitySelected}
                  options={cdekCitySuggestions}
                  isOptionEqualToValue={isOptionEqualToValue}
                  renderOption={(props, option) => (
                    <li {...props} key={option.value}>
                      {option.label}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField {...params} label="Город" fullWidth />
                  )}
                  sx={{ mb: 1 }}
                />
                {cdekCity ? (
                  <>
                    <Box
                      ref={mapsContainerRef}
                      sx={{
                        height: { xs: 200, md: 400 },
                      }}
                    ></Box>
                  </>
                ) : null}
              </Box>
              <Field
                component={TextInput}
                label="Комментарий"
                autoComplete="off"
                name="comment"
                rows={4}
                multiline
                fullWidth
              />
            </Form>
          </Formik>
        ) : null}
      </Box>
    </>
  );
}

function ToPaymentButton() {
  const { t } = useTranslation();
  const { isValid, submitForm } = useFormikContext();
  const point = useSelector(getDeliveryPoint);
  const calculation = useSelector(getDeliveryCalculation);

  return (
    <Button
      size="large"
      variant="contained"
      disabled={!(isValid && point && calculation)}
      onClick={submitForm}
    >
      {t("cart-page-button-complete-order")}
    </Button>
  );
}

function PhoneInputBase({ inputRef, ...props }) {
  const [{ name }, { error, touched }] = useField("phone");

  return (
    <TextField
      {...props}
      error={touched && Boolean(error)}
      helperText={touched ? error : undefined}
      inputRef={inputRef}
      label="Номер телефона"
      autoComplete="off"
      name={name}
      fullWidth
      required
    />
  );
}

function PhoneInput({ inputRef }) {
  const [{ value, onBlur }, _, { setValue }] = useField("phone");

  const onValueChange = useCallback(({ value }) => setValue(value), [setValue]);

  const renderInput = useCallback(
    (props) => <PhoneInputBase inputRef={inputRef} {...props} />,
    [inputRef]
  );

  return (
    <PatternFormat
      mask="_"
      value={value}
      onBlur={onBlur}
      format={phoneFormat}
      customInput={renderInput}
      onValueChange={onValueChange}
      allowEmptyFormatting
      valueIsNumericString
    />
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
