export function ensureSetup(selector, handler) {
  return function (...args) {
    if (document.querySelector(selector)) {
      handler(...args);
    }
  };
}
