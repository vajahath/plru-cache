import { getDefaultOptions, setGottenOptions, IOptions } from "./default-conf";

export abstract class LRU_BASE {
  protected Promise: PromiseConstructor;
  public showAll: () => PromiseLike<any>;
  protected persistentGet: (key: string) => PromiseLike<any>;
  protected persistentDel: (key: string) => PromiseLike<any>;
  protected persistentSet: (key: string, val: any) => PromiseLike<any>;
  protected limit: number;

  constructor(options: IOptions) {
    const defaultOptions = getDefaultOptions();

    this.showAll = options.showAll || defaultOptions.showAll;
    this.Promise = options.promiseLib || Promise;
    this.persistentGet = options.persistentGet || defaultOptions.persistentGet;
    this.persistentSet = options.persistentSet || defaultOptions.persistentSet;
    this.persistentDel = options.persistentDel || defaultOptions.persistentDel;
    this.limit = options.limit || defaultOptions.limit;

    setGottenOptions(Object.assign({}, defaultOptions, options));
  }
}
