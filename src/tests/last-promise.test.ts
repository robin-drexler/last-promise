import { lastPromise } from "../index";

function getResolvablePromise() {
  let resolve: (value: unknown) => void = () => {};
  const promise = new Promise((_resolve) => (resolve = _resolve));

  return { promise, resolve };
}

describe("last-promise", () => {
  it("only resolves promise of last function call even if first resolves earlier", async () => {
    const firstResolveSpy = jest.fn();
    const secondResolveSpy = jest.fn();
    const thirdResolveSpy = jest.fn();

    const firstPromise = getResolvablePromise();
    const secondPromise = getResolvablePromise();
    const thirdPromise = getResolvablePromise();

    const fn = jest
      .fn()
      .mockReturnValueOnce(firstPromise.promise)
      .mockReturnValueOnce(secondPromise.promise)
      .mockReturnValueOnce(thirdPromise.promise);

    const wrappedFn = lastPromise(fn);

    const firstResult = wrappedFn();
    const secondResult = wrappedFn();
    const thirdResult = wrappedFn();

    firstResult.then(firstResolveSpy);
    secondResult.then(secondResolveSpy);
    thirdResult.then(thirdResolveSpy);

    firstPromise.resolve("first");
    thirdPromise.resolve("third");
    secondPromise.resolve("second");

    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(firstResolveSpy).not.toHaveBeenCalled();
    expect(secondResolveSpy).not.toHaveBeenCalled();
    expect(thirdResolveSpy).toHaveBeenCalledWith("third");
  });

  it("supports functions that do not return a promise", () => {
    const fn = jest
      .fn()
      .mockReturnValueOnce("firstReturn")
      .mockReturnValueOnce("secondReturn");

    const wrappedFn = lastPromise(fn);

    const firstResult = wrappedFn("first");
    const secondResult = wrappedFn("second");

    expect(firstResult).toBe("firstReturn");
    expect(secondResult).toBe("secondReturn");

    expect(fn).toHaveBeenNthCalledWith(1, "first");
    expect(fn).toHaveBeenNthCalledWith(2, "second");
  });
});
