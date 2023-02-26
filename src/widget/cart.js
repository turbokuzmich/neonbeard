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
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
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
  getDeliveryType,
  getCdekCitySuggestions,
  getDeliveryFormValues,
  getCdekPoints,
  getCdekPoint,
  getCdekCalculation,
} from "../../store/slices/delivery";
import { DeliveryType } from "../../constants/delivery";

function Cart() {
  const dispatch = useDispatch();

  const map = useRef();
  const clusterer = useRef();
  const phoneFieldRef = useRef();
  const mapsContainerRef = useRef();

  const type = useSelector(getDeliveryType);
  const items = useSelector(getCartItems);
  const universal = useSelector(getUniversal);
  const cartState = useSelector(getCartState);
  const count = useSelector(getCartItemsCount);
  const subtotal = useSelector(getCartSubtotal);
  const catalogState = useSelector(getCatalogState);
  const formValues = useSelector(getDeliveryFormValues);
  const cdekCity = useSelector(getCdekCity);
  const cdekCitySuggestions = useSelector(getCdekCitySuggestions);
  const cdekPoint = useSelector(getCdekPoint);
  const cdekPoints = useSelector(getCdekPoints);
  const cdekCalculation = useSelector(getCdekCalculation);

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

  const setType = useCallback(
    (_, type) => {
      if (type) {
        dispatch(delivery.actions.setType(type));
      }
    },
    [dispatch]
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

  const isOptionEqualToValue = useCallback(
    (cityA, cityB) => cityA.code === cityB.code,
    []
  );

  const onCdekPointSelected = useCallback(
    (point) => dispatch(delivery.actions.setCdekPoint(point)),
    [dispatch]
  );

  useEffect(
    () =>
      ymaps.ready(() => {
        dispatch(delivery.actions.apiLoaded());
      }),
    [dispatch]
  );

  useEffect(() => {
    if (cartState === CartState.delivery && phoneFieldRef.current) {
      phoneFieldRef.current.focus();
    }
  }, [cartState]);

  useEffect(() => {
    if (
      cartState === CartState.delivery &&
      type === DeliveryType.cdek &&
      cdekCity
    ) {
      if (map.current) {
        map.current.destroy();
        map.current = null;
      }

      const { latitude, longitude } = cdekCity;

      map.current = new ymaps.Map(mapsContainerRef.current, {
        center: [latitude, longitude],
        zoom: 11,
        controls: ["smallMapDefaultSet"],
      });
    } else {
      if (map.current) {
        map.current.destroy();
        map.current = null;
      }
    }
  }, [cdekCity, type, cartState]);

  useEffect(() => {
    if (map.current) {
      if (clusterer.current) {
        clusterer.current.removeAll();
        map.current.geoObjects.remove(clusterer.current);
        clusterer.current = null;
      }

      clusterer.current = new ymaps.Clusterer({
        groupByCoordinates: false,
        clusterDisableClickZoom: true,
        clusterHideIconOnBalloonOpen: false,
        geoObjectHideIconOnBalloonOpen: false,
      });

      clusterer.current.balloon.events.add(["open", "click"], () => {
        const { cluster } = clusterer.current.balloon.getData();
        const object = cluster.state.get("activeObject");
        object.events.fire("deluxspa:selected");
      });

      const placemarks = cdekPoints.map((point) => {
        const placemark = new ymaps.Placemark(
          [point.location.latitude, point.location.longitude],
          {
            balloonContentHeader: point.name,
            balloonContentBody: point.location.address_full,
          },
          {
            preset: "islands#circleIcon",
          }
        );

        placemark.events.add(["click", "deluxspa:selected"], () =>
          onCdekPointSelected(point)
        );

        return placemark;
      });

      clusterer.current.add(placemarks);
      map.current.geoObjects.add(clusterer.current);
    }
  }, [cdekPoints, onCdekPointSelected]);

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
                {cdekPoint && cdekCalculation ? (
                  <Typography variant="h6">
                    В пункт «{cdekPoint.name}» на сумму{" "}
                    <Price sum={cdekCalculation.total_sum} /> (
                    {cdekCalculation.period_min} – {cdekCalculation.period_max}{" "}
                    {decline(cdekCalculation.period_max, [
                      "день",
                      "дня",
                      "дней",
                    ])}
                    )
                  </Typography>
                ) : null}
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
                <ToggleButtonGroup value={type} onChange={setType} exclusive>
                  <ToggleButton value={DeliveryType.cdek}>
                    Пункт выдачи СДЭК
                  </ToggleButton>
                  <ToggleButton value={DeliveryType.courier}>
                    Курьером мо Москве
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <Box sx={{ mb: 2 }}>
                {type === DeliveryType.cdek ? (
                  <>
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
                  </>
                ) : null}
                {type === DeliveryType.courier ? (
                  <Field
                    component={TextInput}
                    label="Адрес доставки"
                    autoComplete="off"
                    name="courierAddress"
                    rows={2}
                    multiline
                    fullWidth
                  />
                ) : null}
              </Box>
              <Box sx={{ mb: 2 }}>
                <Field
                  component={TextInput}
                  label="Комментарий"
                  autoComplete="off"
                  name="comment"
                  rows={4}
                  multiline
                  fullWidth
                />
              </Box>
              <ToPaymentButton />
            </Form>
          </Formik>
        ) : null}
      </Box>
    </>
  );
}

function ToPaymentButton() {
  const { isValid, submitForm } = useFormikContext();

  return (
    <Button
      size="large"
      variant="contained"
      disabled={!isValid}
      onClick={submitForm}
    >
      Оплатить
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
