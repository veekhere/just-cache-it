import { CacheIt, CacheValue } from "./index";

/** Test cases for the CacheIt class */

describe("CacheIt", () => {
  test("Create an instance: should create a cache", () => {
    const cache = new CacheIt<number>();


    expect(cache)
      .toBeDefined();

    expect(cache.size())
      .toBe(0);
  });

  test("Set: should set a value in the cache", () => {
    const cache = new CacheIt<number>();

    cache.set("key", 1);


    expect(cache.size())
      .toBe(1);

    expect(cache.get("key"))
      .toBeDefined();

    expect(cache.get("key")?.unwrapCurrent())
      .toBe(1);
  });

  test("Get: should get a value from the cache", () => {
    const cache = new CacheIt<number>();

    cache.set("key", 1);


    expect(cache.get("key")?.unwrapCurrent())
      .toBe(1);
  });

  test("Delete: should delete a value from the cache", () => {
    const cache = new CacheIt<number>();

    cache.set("key", 1);


    expect(cache.delete("key"))
      .toBe(true);

    expect(cache.delete("key"))
      .toBe(false);
  });

  test("Clear: should clear the cache", () => {
    const cache = new CacheIt<number>();

    cache.set("key", 1);
    cache.set("key2", 2);


    expect(cache.size())
      .toBe(2);


    cache.clear();


    expect(cache.size())
      .toBe(0);
  });

  test("Has: should check if a key exists in the cache", () => {
    const cache = new CacheIt<number>();

    cache.set("key", 1);


    expect(cache.has("key"))
      .toBe(true);

    expect(cache.has("key2"))
      .toBe(false);
  });

  test("Subscribe: should subscribe to changes in the cache", () => {
    const callbackMock = jest.fn(() => { /* do nothing */ });

    const cache = new CacheIt<number>();
    const subscription = cache.subscribe(callbackMock);


    expect(subscription)
      .toBeDefined();

    expect(subscription.unsubscribe)
      .toBeDefined();


    cache.set("key", 1);


    expect(callbackMock)
      .toHaveBeenCalledTimes(1);
  });

  test("Unsubscribe: should unsubscribe from changes in the cache", () => {
    const callbackMock = jest.fn(() => { /* do nothing */ });

    const cache = new CacheIt<number>();
    const subscription = cache.subscribe(callbackMock);


    expect(subscription)
      .toBeDefined();


    cache.set("key", 1);

    subscription.unsubscribe();

    cache.set("key2", 2);


    expect(callbackMock)
      .toHaveBeenCalledTimes(1);
  });

  test("UnsubscribeAll: should unsubscribe from all changes in the cache", () => {
    const callbackMock = jest.fn(() => { /* do nothing */ });

    const cache = new CacheIt<number>();

    const subscription1 = cache.subscribe(callbackMock);
    const subscription2 = cache.subscribe(callbackMock);


    expect(subscription1)
      .toBeDefined();

    expect(subscription2)
      .toBeDefined();


    cache.set("key", 1);
    cache.set("key2", 2);

    cache.unsubscribeAll();

    cache.set("key3", 3);


    expect(callbackMock)
      .toHaveBeenCalledTimes(4);
  });
});

/** Test cases for the CacheValue class */

describe("CacheValue", () => {
  test("Update: should update the value", () => {
    const cache = new CacheIt<number>();

    const cacheValue = cache.set("key", 1);


    expect(cacheValue)
      .toBeInstanceOf(CacheValue);


    expect(cacheValue.unwrapPrevious())
      .toBeUndefined();

    expect(cacheValue.unwrapCurrent())
      .toBe(1);
  });

  test("Unwraps: should unwrap the values", () => {
    const onPresentMock = jest.fn((value: number) => { value; });
    const onAbsentMock = jest.fn(() => { /* do nothing */ });

    const cache = new CacheIt<number>();
    const cacheValue = cache.set("key", 1);


    expect(cacheValue)
      .toBeInstanceOf(CacheValue);


    expect(cacheValue.unwrapPrevious())
      .toBeUndefined();

    expect(cacheValue.unwrapCurrent())
      .toBe(1);


    cacheValue.update(2);


    expect(cacheValue.unwrapPrevious())
      .toBe(1);

    expect(cacheValue.unwrapCurrent())
      .toBe(2);


    cacheValue.unwrapPrevious({ onPresent: onPresentMock, onAbsent: onAbsentMock });


    expect(onAbsentMock)
      .not
      .toHaveBeenCalled();

    expect(onPresentMock)
      .toHaveBeenCalled();


    cacheValue.update(3);


    expect(cacheValue.unwrapPrevious())
      .toBe(2);

    expect(cacheValue.unwrapCurrent())
      .toBe(3);


    onPresentMock.mockClear();
    onAbsentMock.mockClear();
    cacheValue.unwrapPrevious({ onPresent: onPresentMock, onAbsent: onAbsentMock });


    expect(onAbsentMock)
      .not
      .toHaveBeenCalled();

    expect(onPresentMock)
      .toHaveBeenCalled();
  });

  test("Subscribe: should subscribe to changes in the cache value", () => {
    const callbackMock = jest.fn(() => { /* do nothing */ });

    const cache = new CacheIt<number>();
    const cacheValue = cache.set("key", 1);


    expect(cacheValue)
      .toBeInstanceOf(CacheValue);


    cacheValue.subscribe({
      next: callbackMock,
    });


    expect(callbackMock)
      .not
      .toHaveBeenCalled();


    cacheValue.update(2);


    expect(callbackMock)
      .toHaveBeenCalledTimes(1);


    cacheValue.clear();


    expect(callbackMock)
      .toHaveBeenCalledTimes(2);
  });

  test("Unsubscribe: should unsubscribe from changes in the cache value", () => {
    const callbackMock = jest.fn(() => { /* do nothing */ });

    const cache = new CacheIt<number>();
    const cacheValue = cache.set("key", 1);


    expect(cacheValue)
      .toBeInstanceOf(CacheValue);


    const subscription = cacheValue.subscribe({
      complete: callbackMock,
    });


    expect(subscription)
      .toBeDefined();


    subscription.unsubscribe();


    expect(callbackMock)
      .toHaveBeenCalled();
  });

  test("UnsubscribeAll: should unsubscribe from all changes in the cache value", () => {
    const callbackMock = jest.fn(() => { /* do nothing */ });

    const cache = new CacheIt<number>();
    const cacheValue = cache.set("key", 1);


    expect(cacheValue)
      .toBeInstanceOf(CacheValue);


    const subscription1 = cacheValue.subscribe({
      complete: callbackMock,
    });
    const subscription2 = cacheValue.subscribe({
      complete: callbackMock,
    });


    expect(subscription1)
      .toBeDefined();

    expect(subscription2)
      .toBeDefined();


    cacheValue.unsubscribeAll();


    expect(callbackMock)
      .toHaveBeenCalledTimes(2);
  });
});
