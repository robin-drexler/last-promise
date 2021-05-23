import { lastPromise } from "../index";
import { getResolvablePromise, nextTick } from "./utils";

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

    await nextTick();

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

  it("only rejects promise of last function call even if first rejects earlier", async () => {
    const firstRejectSpy = jest.fn();
    const secondRejectSpy = jest.fn();

    const firstResolveSpy = jest.fn();
    const secondResolveSpy = jest.fn();

    const firstPromise = getResolvablePromise();
    const secondPromise = getResolvablePromise();

    const fn = jest
      .fn()
      .mockReturnValueOnce(firstPromise.promise)
      .mockReturnValueOnce(secondPromise.promise);

    const wrappedFn = lastPromise(fn);

    const firstResult = wrappedFn();
    const secondResult = wrappedFn();

    firstResult.then(firstResolveSpy, firstRejectSpy);
    secondResult.then(secondResolveSpy, secondRejectSpy);

    firstPromise.reject("first");
    secondPromise.reject("second");

    await nextTick();

    expect(firstRejectSpy).not.toHaveBeenCalled();
    expect(secondRejectSpy).toHaveBeenCalledWith("second");

    expect(firstResolveSpy).not.toHaveBeenCalled();
    expect(secondResolveSpy).not.toHaveBeenCalled();
  });
});
