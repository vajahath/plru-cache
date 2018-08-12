import { LRU } from "./lru";

async function testCache() {
  const cache = new LRU(5);

  console.log("cache init");
  await cache.init();

  cache.show();

  try {
    await cache.keep("a", 55);
    await cache.keep("b", 45);
    await cache.keep("c", 88);
    await cache.keep("d", 88);
    await cache.keep("e", 77);
    await cache.keep("f", 33);
    await cache.keep("g", 58);
  } catch (err) {
    console.log(err);
  }

  cache.show();
}

testCache();
