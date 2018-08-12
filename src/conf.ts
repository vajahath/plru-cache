export interface IOptions {
  limit?: number;
  promiseLib?: any;
  persistentSet?: (key: string, val: any) => PromiseLike<void>;
  persistentGet?: (key: string) => PromiseLike<any>;
  persistentDel?: (key: string) => PromiseLike<any>;
  showAll?: () => PromiseLike<any>;
}

export const defaultOptions: IOptions = {
  limit: Infinity,
  promiseLib: Promise,
  async persistentSet(id: string, val: any) {
    this.store[id] = val;
    return;
  },
  async persistentGet(id: string) {
    return this.store[id];
  },
  async persistentDel(id: string) {
    delete this.store[id];
    return;
  },
  async showAll() {
    return JSON.stringify(this.store, null, 2);
  }
};
