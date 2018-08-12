export class LruNode {
  public nextKey: string;
  public prevKey: string;
  public val: any;
  public key: string;

  constructor(
    key: string,
    val: any,
    nextKey: string = null,
    prevKey: string = null
  ) {
    this.key = key;
    this.val = val;
    this.nextKey = nextKey;
    this.prevKey = prevKey;
  }

  public async save(
    persistentSet: (key: string, val: any) => PromiseLike<void>
  ): Promise<void> {
    await persistentSet.call(null, this.key, {
      key: this.key,
      val: this.val,
      nextKey: this.nextKey,
      prevKey: this.prevKey
    });
    return;
  }

  public static async remove(
    persistentGet: (key: string) => PromiseLike<any>,
    persistentDel: (key: string) => PromiseLike<void>,
    key: string
  ): Promise<LruNode> {
    const node = await persistentGet.call(null, key);
    await persistentDel.call(null, key);
    return new LruNode(node.key, node.val, node.nextKey, node.prevKey);
  }

  public static async find(
    persistentGet: (key: string) => PromiseLike<any>,
    gottenKey: string
  ): Promise<LruNode> {
    const node = await persistentGet.call(null, gottenKey);
    if (node) {
      return new LruNode(node.key, node.val, node.nextKey, node.prevKey);
    }
    return undefined;
  }
}
