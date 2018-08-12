import { PLRU } from "./lru";

async function testCache() {
  const cache = new PLRU(5);

  console.log("cache init");
  await cache.init();

  cache.show();

  try {
    await cache.set("a", 55);
    await cache.set("b", 45);
    await cache.set("c", 88);
    await cache.set("d", 88);
    await cache.set("e", 77);
    await cache.set("f", 33);
    await cache.set("g", 58);
  } catch (err) {
    console.log(err);
  }

  cache.show();
}

testCache();
