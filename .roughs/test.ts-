import { LRU } from ".";

async function testCache() {
  const cache = new LRU({
    limit: 5
  });

  console.log("cache init");
  await cache.init();

  console.log(await cache.showAll());

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

  console.log(await cache.showAll());
}

testCache();
