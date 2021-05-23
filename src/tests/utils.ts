export function getResolvablePromise() {
  let resolve: (value: unknown) => void = () => {};
  let reject: (value: unknown) => void = () => {};

  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  return { promise, resolve, reject };
}

export function nextTick() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}
