import { CacheIt, CacheValue } from "./index";

class TestClass {
  public test: string;

  constructor(test: string) {
    this.test = test;
  }
}

/** Test cases for the CacheIt class */

describe("CacheIt", () => {
  test("Create an instance: should create a cache", () => {
    const cache = new CacheIt<TestClass>();


    expect(cache)
      .toBeDefined();

    expect(cache.size())
      .toBe(0);
  });

  test("Set: should set a value in the cache", () => {
    const value = new TestClass("test");

    const cache = new CacheIt<TestClass>();

    cache.set("key", value);


    expect(cache.get("key")?.unwrapCurrent())
      .toEqual(value);

    expect(cache.get("key")?.unwrapCurrent())
      .not
      .toBe(value);


    value.test = "updated";


    expect(cache.get("key")?.unwrapCurrent())
      .not
      .toEqual(value);
  });

  test("Get: should get a value from the cache", () => {
    const value = new TestClass("test");

    const cache = new CacheIt<TestClass>();

    cache.set("key", value);


    expect(cache.get("key")?.unwrapCurrent())
      .toEqual(value);

    expect(cache.get("key")?.unwrapCurrent())
      .not
      .toBe(value);


    value.test = "updated";


    expect(cache.get("key")?.unwrapCurrent())
      .not
      .toEqual(value);
  });

  test("Delete: should delete a value from the cache", () => {
    const value = new TestClass("test");

    const cache = new CacheIt<TestClass>();

    cache.set("key", value);


    expect(cache.delete("key"))
      .toBe(true);

    expect(cache.delete("key"))
      .toBe(false);

    expect(cache.delete("key1337"))
      .toBe(false);
  });

  test("Clear: should clear the cache", () => {
    const value1 = new TestClass("test");
    const value2 = new TestClass("test2");

    const cache = new CacheIt<TestClass>();

    cache.set("key", value1);
    cache.set("key2", value2);

    expect(cache.size())
      .toBe(2);


    cache.clear();


    expect(cache.size())
      .toBe(0);
  });

  test("Has: should check if a key exists in the cache", () => {
    const value = new TestClass("test");

    const cache = new CacheIt<TestClass>();

    cache.set("key", value);


    expect(cache.has("key"))
      .toBe(true);

    expect(cache.has("key2"))
      .toBe(false);
  });

  test("Subscribe: should subscribe to changes in the cache", () => {
    const callbackMock = jest.fn(() => { /* do nothing */ });

    const value = new TestClass("test");

    const cache = new CacheIt<TestClass>();
    const subscription = cache.subscribe(callbackMock);


    expect(subscription)
      .toBeDefined();

    expect(subscription.unsubscribe)
      .toBeDefined();


    cache.set("key", value);


    expect(callbackMock)
      .toHaveBeenCalledTimes(1);
  });

  test("Unsubscribe: should unsubscribe from changes in the cache", () => {
    const callbackMock = jest.fn(() => { /* do nothing */ });

    const value1 = new TestClass("test");
    const value2 = new TestClass("test2");

    const cache = new CacheIt<TestClass>();
    const subscription = cache.subscribe(callbackMock);


    expect(subscription)
      .toBeDefined();


    cache.set("key", value1);

    subscription.unsubscribe();

    cache.set("key2", value2);


    expect(callbackMock)
      .toHaveBeenCalledTimes(1);
  });

  test("UnsubscribeAll: should unsubscribe from all changes in the cache", () => {
    const callbackMock = jest.fn(() => { /* do nothing */ });

    const value1 = new TestClass("test");
    const value2 = new TestClass("test2");
    const value3 = new TestClass("test3");

    const cache = new CacheIt<TestClass>();

    const subscription1 = cache.subscribe(callbackMock);
    const subscription2 = cache.subscribe(callbackMock);


    expect(subscription1)
      .toBeDefined();

    expect(subscription2)
      .toBeDefined();


    cache.set("key", value1);
    cache.set("key2", value2);

    cache.unsubscribeAll();

    cache.set("key3", value3);


    expect(callbackMock)
      .toHaveBeenCalledTimes(4);
  });
});

/** Test cases for the CacheValue class */

describe("CacheValue", () => {
  test("Update: should update the value", () => {
    const value = new TestClass("test");

    const cache = new CacheIt<TestClass>();

    const cacheValue = cache.set("key", value);


    expect(cacheValue)
      .toBeInstanceOf(CacheValue);


    expect(cacheValue.unwrapPrevious())
      .toBeUndefined();

    expect(cacheValue.unwrapCurrent())
      .toEqual(value);

    expect(cacheValue.unwrapCurrent())
      .not
      .toBe(value);


    value.test = "updated";


    expect(cacheValue.unwrapPrevious())
      .toBeUndefined();

    expect(cacheValue.unwrapCurrent())
      .not
      .toEqual(value);
  });

  test("Unwraps: should unwrap the values", () => {
    const onPresentMock = jest.fn((value: TestClass) => { value; });
    const onAbsentMock = jest.fn(() => { /* do nothing */ });

    const value1 = new TestClass("test");
    const value2 = new TestClass("test2");
    const value3 = new TestClass("test3");

    const cache = new CacheIt<TestClass>();
    const cacheValue = cache.set("key", value1);

    expect(cacheValue)
      .toBeInstanceOf(CacheValue);


    expect(cacheValue.unwrapPrevious())
      .toBeUndefined();

    expect(cacheValue.unwrapCurrent())
      .toEqual(value1);

    expect(cacheValue.unwrapCurrent())
      .not
      .toBe(value1);


    cacheValue.update(value2);


    expect(cacheValue.unwrapPrevious())
      .toEqual(value1);

    expect(cacheValue.unwrapPrevious())
      .not
      .toBe(value1);

    expect(cacheValue.unwrapCurrent())
      .toEqual(value2);

    expect(cacheValue.unwrapCurrent())
      .not
      .toBe(value2);


    cacheValue.unwrapPrevious({ onPresent: onPresentMock, onAbsent: onAbsentMock });


    expect(onAbsentMock)
      .not
      .toHaveBeenCalled();

    expect(onPresentMock)
      .toHaveBeenCalled();


    cacheValue.update(value3);


    expect(cacheValue.unwrapPrevious())
      .toEqual(value2);

    expect(cacheValue.unwrapPrevious())
      .not
      .toBe(value2);

    expect(cacheValue.unwrapCurrent())
      .toEqual(value3);

    expect(cacheValue.unwrapCurrent())
      .not
      .toBe(value3);


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

    const value1 = new TestClass("test");
    const value2 = new TestClass("test2");

    const cache = new CacheIt<TestClass>();
    const cacheValue = cache.set("key", value1);


    expect(cacheValue)
      .toBeInstanceOf(CacheValue);


    cacheValue.subscribe({
      next: callbackMock,
    });


    expect(callbackMock)
      .not
      .toHaveBeenCalled();


    cacheValue.update(value2);


    expect(callbackMock)
      .toHaveBeenCalledTimes(1);


    cacheValue.clear();


    expect(callbackMock)
      .toHaveBeenCalledTimes(2);
  });

  test("Unsubscribe: should unsubscribe from changes in the cache value", () => {
    const callbackMock = jest.fn(() => { /* do nothing */ });

    const value = new TestClass("test");

    const cache = new CacheIt<TestClass>();
    const cacheValue = cache.set("key", value);


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

    const value = new TestClass("test");

    const cache = new CacheIt<TestClass>();
    const cacheValue = cache.set("key", value);


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
