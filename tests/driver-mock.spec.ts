import { LRU } from "../src";

const store: any = {};

const cache = new LRU({
  limit: 10,
  persistentSet(key, val) {
    return new Promise(resolve => {
      setTimeout(() => {
        store[key] = val;
        resolve();
      }, 100);
    });
  },
  persistentGet(key) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(store[key]);
      }, 100);
    });
  },
  persistentDel(key) {
    return new Promise(resolve => {
      setTimeout(() => {
        const t = store[key];
        delete store[key];
        resolve(t);
      }, 100);
    });
  },
  showAll() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(JSON.stringify(store, null, 2));
      }, 100);
    });
  }
});

beforeAll(async () => {
  await cache.init();
});

describe("mocking driver", () => {
  test(
    "normal-flow",
    async () => {
      await cache.set("1", 1);
      await cache.set("2", 2);
      await cache.set("3", 3);
      await cache.set("4", 4);
      await cache.set("5", 5);
      await cache.set("6", 6);
      await cache.set("7", 7);
      await cache.set("8", 8);

      await cache.remove("7");

      console.log(await cache.showAll());
    },
    60000
  );
});
