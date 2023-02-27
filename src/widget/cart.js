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
  getCourierAddress,
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
  const courierAddress = useSelector(getCourierAddress);

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

  const onPhoneChange = useCallback(
    (phone) => dispatch(delivery.actions.setPhone(phone)),
    [dispatch]
  );

  const onEmailChange = useCallback(
    (event) => dispatch(delivery.actions.setEmail(event.target.value)),
    [dispatch]
  );

  const onCommentChange = useCallback(
    (event) => dispatch(delivery.actions.setComment(event.target.value)),
    [dispatch]
  );

  const onCourierAddressChange = useCallback(
    (event) => dispatch(delivery.actions.setCourierAddress(event.target.value)),
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
                      gap: {
                        xs: 2,
                        md: 4,
                      },
                      display: "flex",
                      alignItems: {
                        xs: "center",
                        md: "flex-start",
                      },
                      flexDirection: {
                        xs: "column",
                        md: "row",
                      },
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
                        alignItems: {
                          xs: "center",
                          md: "flex-start",
                        },
                        pt: {
                          xs: 0,
                          md: 1,
                        },
                        pb: {
                          xs: 0,
                          md: 1,
                        },
                      }}
                    >
                      <Link
                        variant="h6"
                        href={catalogItem.url}
                        paragraph
                        sx={{
                          textAlign: {
                            xs: "center",
                            md: "start",
                          },
                        }}
                      >
                        {catalogItem.title}
                      </Link>
                      <Typography>{catalogItem.volume}</Typography>
                    </Box>
                    <Box
                      sx={{
                        pt: {
                          xs: 0,
                          md: 1,
                        },
                        gap: {
                          xs: 2,
                          md: 0,
                        },
                        flexDirection: {
                          xs: "column",
                          md: "row",
                        },
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ display: "flex" }}>
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
                      </Box>
                      <Typography
                        component="div"
                        variant="h6"
                        textAlign="right"
                        sx={{
                          minWidth: {
                            xs: "auto",
                            md: 120,
                          },
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
                gap: {
                  xs: 2,
                  md: 0,
                },
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexDirection: {
                  xs: "column-reverse",
                  md: "row",
                },
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
              flexDirection: {
                xs: "column",
                md: "row",
              },
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
            {cartState === CartState.delivery ? (
              <Button variant="outlined" size="medium" onClick={toItems}>
                Изменить
              </Button>
            ) : null}
          </Box>
        )}
        {cartState === CartState.delivery ? (
          <Formik
            onSubmit={toPayment}
            initialValues={formValues}
            validationSchema={checkoutValidationSchema}
            enableReinitialize
            validateOnMount
          >
            <Form>
              <Box
                sx={{
                  mb: 4,
                  gap: 2,
                  display: "flex",
                  alignItems: "center",
                  flexDirection: {
                    xs: "column",
                    md: "row",
                  },
                }}
              >
                <Typography variant="h4" sx={{ flexGrow: 1 }}>
                  Доставка
                </Typography>
                {type === DeliveryType.cdek && cdekPoint && cdekCalculation ? (
                  <Typography
                    variant="h6"
                    sx={{
                      textAlign: {
                        xs: "center",
                        md: "start",
                      },
                    }}
                  >
                    В пункт «{cdekPoint.name}» на сумму{" "}
                    <Price sum={cdekCalculation.total_sum} /> (
                    {cdekCalculation.period_min ===
                    cdekCalculation.period_max ? (
                      <>
                        {cdekCalculation.period_max}{" "}
                        {decline(cdekCalculation.period_max, [
                          "день",
                          "дня",
                          "дней",
                        ])}
                      </>
                    ) : (
                      <>
                        {cdekCalculation.period_min} –{" "}
                        {cdekCalculation.period_max}{" "}
                        {decline(cdekCalculation.period_max, [
                          "день",
                          "дня",
                          "дней",
                        ])}
                      </>
                    )}
                    )
                  </Typography>
                ) : null}
              </Box>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  mb: 2,
                  flexDirection: {
                    xs: "column",
                    md: "row",
                  },
                }}
              >
                <PhoneInput inputRef={phoneFieldRef} onChange={onPhoneChange} />
                <Field
                  component={TextInput}
                  onChange={onEmailChange}
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
                      noOptionsText="Выберите город"
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
                        <Box ref={mapsContainerRef} sx={{ height: 400 }}></Box>
                      </>
                    ) : null}
                  </>
                ) : null}
                {type === DeliveryType.courier ? (
                  <Field
                    onChange={onCourierAddressChange}
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
                  onChange={onCommentChange}
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
        {cartState === CartState.payment ? (
          <>
            <Box
              sx={{
                mb: 4,
                gap: 2,
                display: "flex",
                alignItems: "center",
                flexDirection: {
                  xs: "column",
                  md: "row",
                },
              }}
            >
              <Typography variant="h4" sx={{ flexGrow: 1 }}>
                Доставка
              </Typography>
              {type === DeliveryType.cdek && cdekPoint && cdekCalculation ? (
                <Typography
                  variant="h6"
                  sx={{
                    textAlign: {
                      xs: "center",
                      md: "start",
                    },
                  }}
                >
                  В пункт «{cdekPoint.name}» на сумму{" "}
                  <Price sum={cdekCalculation.total_sum} /> (
                  {cdekCalculation.period_min === cdekCalculation.period_max ? (
                    <>
                      {cdekCalculation.period_max}{" "}
                      {decline(cdekCalculation.period_max, [
                        "день",
                        "дня",
                        "дней",
                      ])}
                    </>
                  ) : (
                    <>
                      {cdekCalculation.period_min} –{" "}
                      {cdekCalculation.period_max}{" "}
                      {decline(cdekCalculation.period_max, [
                        "день",
                        "дня",
                        "дней",
                      ])}
                    </>
                  )}
                  )
                </Typography>
              ) : null}
              {type === DeliveryType.courier ? (
                <Typography
                  variant="h6"
                  sx={{
                    pl: 3,
                    width: 300,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {courierAddress.trim().length > 0
                    ? courierAddress.trim()
                    : "Адрес не указан"}
                </Typography>
              ) : null}
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                clear: "both",
              }}
            >
              <Progress />
            </Box>
          </>
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

function PhoneInput({ inputRef, onChange }) {
  const [{ value, onBlur }, _, { setValue }] = useField("phone");

  const onValueChange = useCallback(
    ({ value }) => {
      setValue(value);
      onChange(value);
    },
    [setValue, onChange]
  );

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
