import { LRU } from "../src";

describe("functional tests", () => {
  test("flow-test-limit(2)", async () => {
    const cache = new LRU({
      limit: 2
    });
    await cache.init();

    let headers = await cache._getHeaders();
    expect(headers.size).toBe(0);
    expect(headers.headKey).toBe(null);
    expect(headers.tailKey).toBe(null);

    await cache.set("one", 1);

    headers = await cache._getHeaders();
    expect(headers.size).toBe(1);
    expect(headers.headKey).toBe("one");
    expect(headers.tailKey).toBe("one");

    await cache.set("two", 2);

    headers = await cache._getHeaders();
    expect(headers.size).toBe(2);
    expect(headers.headKey).toBe("two");
    expect(headers.tailKey).toBe("one");

    await cache.set("three", 3);

    headers = await cache._getHeaders();
    expect(headers.size).toBe(2);
    expect(headers.headKey).toBe("three");
    expect(headers.tailKey).toBe("two");

    {
      const twoResult = await cache.get("two");
      expect(twoResult).toBe(2);
    }

    headers = await cache._getHeaders();
    expect(headers.size).toBe(2);
    expect(headers.headKey).toBe("two");
    expect(headers.tailKey).toBe("three");
  });

  test.only("add 1 item to cache and verify it", async () => {
    const cache = new LRU({
      limit: 1
    });
    await cache.init();

    await cache.set("key1", 8989);

    const saved = await cache.get("key1");
    expect(saved).toBe(8989);

    await cache.remove("key1");
    let headers = await cache._getHeaders();

    expect(headers.size).toBe(0);
    expect(headers.headKey).toBe(null);
    expect(headers.tailKey).toBe(null);

    console.log(await cache.showAll());
  });

  test("add 10 item to cache, verify first 5 are deleted", async () => {
    const cache = new LRU({
      limit: 5
    });
    await cache.init();

    const setPromises = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(item =>
      cache.set(item + "iio", item)
    );
    await Promise.all(setPromises);
    const [zero, one, two, three, four] = await Promise.all([
      cache.get("0"),
      cache.get("1"),
      cache.get("2"),
      cache.get("3"),
      cache.get("4")
    ]);
    expect(zero || one || two || three || four).toBeFalsy();
  });
});
