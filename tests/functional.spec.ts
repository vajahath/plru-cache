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

  test("flow-test-limit(1)", async () => {
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

    await cache.set("meaw meaw", "cat");

    headers = await cache._getHeaders();
    expect(headers.size).toBe(1);
    expect(headers.headKey).toBe("meaw meaw");
    expect(headers.tailKey).toBe("meaw meaw");
  });

  test("flow-test-limit(0)", async () => {
    try {
      const cache = new LRU({
        limit: 0
      });
    } catch (err) {
      expect(err.message).toBe("Limit<1 is not allowed");
    }
  });

  test("normal-flow", async () => {
    const cache = new LRU({
      limit: 5
    });
    await cache.init();

    await cache.set("1", 1);
    await cache.set("2", 2);
    await cache.set("3", 3);
    await cache.set("4", 4);
    await cache.set("5", 5);
    await cache.set("6", 6);
    await cache.set("7", 7);
    await cache.set("8", 8);

    let headers = await cache._getHeaders();
    expect(headers.size).toBe(5);
    expect(headers.headKey).toBe("8");
    expect(headers.tailKey).toBe("4");

    expect(await cache.get("3")).toBeUndefined();
    expect(await cache.get("6")).toBe(6);

    headers = await cache._getHeaders();
    expect(headers.size).toBe(5);
    expect(headers.headKey).toBe("6");
    expect(headers.tailKey).toBe("4");

    await cache.remove("7");

    headers = await cache._getHeaders();
    expect(headers.size).toBe(4);
    expect(headers.headKey).toBe("6");
    expect(headers.tailKey).toBe("4");
  });

  test.skip("add 10 item to cache, verify first 5 are deleted", async () => {
    const cache = new LRU({
      limit: 5
    });
    await cache.init();

    const setPromises = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(item =>
      cache.set(item + "", item)
    );
    await Promise.all(setPromises);
    const [zero, one, two, three, four] = await Promise.all([
      cache.get("0"),
      cache.get("1"),
      cache.get("2"),
      cache.get("3"),
      cache.get("4")
    ]);
    console.log(await cache.showAll());
    expect(zero || one || two || three || four).toBeFalsy();
    const secondHalf = await Promise.all([
      cache.get("5"),
      cache.get("6"),
      cache.get("7"),
      cache.get("8"),
      cache.get("9")
    ]);
    expect(secondHalf.reduce((acc, val) => acc + val)).toBe(35);
  });
});
