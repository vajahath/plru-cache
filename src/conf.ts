/**
 * if no config is given, this store will be used
 */
const store: { [key: string]: any } = {};

export interface IOptions {
  limit?: number;
  promiseLib?: any;
  persistentSet?: (key: string, val: any) => PromiseLike<void>;
  persistentGet?: (key: string) => PromiseLike<any>;
  persistentDel?: (key: string) => PromiseLike<any>;
  showAll?: () => PromiseLike<any>;
}

const config: { [key: string]: IOptions } = {
  defaultOptions: {
    limit: Infinity,
    promiseLib: Promise,
    async persistentSet(id: string, val: any) {
      store[id] = val;
      return;
    },
    async persistentGet(id: string) {
      return store[id];
    },
    async persistentDel(id: string) {
      delete store[id];
      return;
    },
    async showAll() {
      return JSON.stringify(store, null, 2);
    }
  },
  gottenOptions: {}
};

export function getDefaultOptions() {
  return config.defaultOptions;
}
export function setGottenOptions(options: IOptions) {
  config.gottenOptions = options;
}
export function getGottenOptions() {
  return config.gottenOptions;
}
