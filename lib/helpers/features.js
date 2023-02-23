import memoize from "lodash/memoize";

export const isTouch = memoize(
  () =>
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
);

export const isServer = memoize(() => typeof window === "undefined");
