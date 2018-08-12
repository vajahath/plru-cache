import { LRU } from "../src";

describe("testing limit with 5", () => {
  const cache = new LRU({
    limit: 5
  });

  test("add 1 item to cache and verify it", async () => {
    await cache.set("key1", 8989);
    const saved = await cache.get("key1");
    expect(saved).toBe(8989);
  });
});
