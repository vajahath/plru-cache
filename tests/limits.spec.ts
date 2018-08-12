import { LRU } from "../src";

describe("testing limit with 5", () => {
  test("add 1 item to cache and verify it", async () => {
    const cache = new LRU({
      limit: 1
    });
    await cache.set("key1", 8989);
    const saved = await cache.get("key1");
    expect(saved).toBe(8989);
  });

  test("add 10 item to cache, verify first 5 are deleted", async () => {
    const cache = new LRU({
      limit: 5
    });
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

  test.skip("", async () => {
    const cache = new LRU({
      limit: 5
    });
    const setPromises = [0, 1, 2, 3, 4].map(item => cache.set(item + "", item));
    await Promise.all(setPromises); // cache full now!
    console.log("all set\n", await cache.showAll());
    // fetch tail
    expect(await cache.get("0")).toBe(0);
    console.log("cache-get(0)\n", await cache.showAll());
    // cache something again
    await cache.set("5", 5);
    console.log("cache-set(5)\n", await cache.showAll());

    const [one, five] = await Promise.all([cache.get("1"), cache.get("5")]);
    console.log("cache get (1,5)\n", await cache.showAll());
    expect(one).toBeUndefined();
    expect(five).toBe(5);
  });
});