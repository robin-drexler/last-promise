export function lastPromise<R, P extends any[]>(fn: (...args: P) => R) {
  let current: Object;
  return function (...args: P): R {
    current = {};

    const result = fn(...args);

    if (!isPromise(result)) {
      return result;
    } else {
      return new Promise((resolve) => {
        let token = current;
        result.then((promiseResult) => {
          if (current === token) {
            resolve(promiseResult);
          }
        });
      }) as any;
    }
  };
}

function isPromise<T, S>(something: S | Promise<T>): something is Promise<T> {
  if (
    typeof something == "undefined" ||
    typeof something != "object" ||
    !("then" in something) ||
    typeof something.then !== "function"
  ) {
    return false;
  }

  return true;
}
