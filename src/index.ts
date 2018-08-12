import { IOptions } from "./conf";
import { LRU_BASE } from "./lru-base";
import { LruNode } from "./lru-node";

const CACHE_SIZE = "__@cache_size_";
const HEAD_KEY = "__@cache_head_key_";
const TAIL_KEY = "__@cache_tail_key_";

export class LRU extends LRU_BASE {
  constructor(options: IOptions) {
    super(options);
  }

  public async init() {
    if (await this.isFreshCache()) {
      await this.initMetaData();
      return;
    }
  }

  public async set(key: string, val: any) {
    const node = new LruNode(key, val);
    const foundNode = await LruNode.find(this.persistentGet, key);
    if (foundNode) {
      await LruNode.remove(
        this.persistentGet,
        this.persistentDel,
        foundNode.key
      );
    } else {
      const currentCacheSize = await this.getSize();
      if (currentCacheSize >= this.limit) {
        const tailNode = await this.getTailNode();
        await LruNode.remove(
          this.persistentGet,
          this.persistentDel,
          tailNode.key
        );
        await this.setSize(currentCacheSize - 1);
        await this.setTailKey(tailNode.prevKey);
        const newTail = await this.getTailNode(tailNode.prevKey);
        if (newTail) {
          newTail.nextKey = null;
          await newTail.save(this.persistentSet);
        }
      }
    }
    await this.setHead(node);
  }

  public async get(key: string) {
    const foundNode = await LruNode.find(this.persistentGet, key);

    if (foundNode) {
      const val = foundNode.val;
      const node = new LruNode(key, val);
      await LruNode.remove(this.persistentGet, this.persistentDel, key);
      await this.setHeadKey(node.key);
      return val;
    } else {
      console.log(`Key ${key} not stored in cache`);
      return undefined;
    }
  }

  public async remove(key: string) {
    const node = await LruNode.find(this.persistentGet, key);
    const nodePrevNode = await LruNode.find(this.persistentGet, node.prevKey);
    const nodeNextNode = await LruNode.find(this.persistentGet, node.nextKey);

    if (nodePrevNode) {
      nodePrevNode.nextKey = node.nextKey;
    } else {
      await this.setHeadKey(nodeNextNode.key);
    }
    if (nodeNextNode) {
      nodeNextNode.prevKey = node.prevKey;
    } else {
      this.setTailKey(nodePrevNode.key);
    }
    await nodePrevNode.save(this.persistentSet);
    await nodeNextNode.save(this.persistentSet);
    await LruNode.remove(this.persistentGet, this.persistentDel, node.key);
    return node;
  }

  private async isFreshCache() {
    const [size, headKey, tailKey] = await this.Promise.all([
      this.getSize(),
      this.getHeadKey(),
      this.getTailKey()
    ]);
    if (size || headKey || tailKey) {
      return false;
    } else {
      return true;
    }
  }

  private initMetaData() {
    return this.Promise.all([
      this.setSize(0),
      this.setHeadKey(null),
      this.setTailKey(null)
    ]);
  }

  private async setSize(size: number): Promise<void> {
    await this.persistentSet(CACHE_SIZE, size);
    return;
  }

  private async getSize(): Promise<number> {
    const size = await this.persistentGet(CACHE_SIZE);
    return size;
  }

  private async getHeadKey(): Promise<string> {
    const headKey = await this.persistentGet(HEAD_KEY);
    return headKey;
  }

  private async getHeadNode(key?: string) {
    const headKey = key || (await this.getHeadKey());
    const headNode = await LruNode.find(this.persistentGet, headKey);
    return headNode;
  }

  private async getTailKey(): Promise<string> {
    const tailKey = await this.persistentGet(TAIL_KEY);
    return tailKey;
  }

  private async getTailNode(key?: string) {
    const tailKey = key || (await this.getTailKey());
    const tailNode = await LruNode.find(this.persistentGet, tailKey);
    return tailNode;
  }

  private async setHeadKey(key: string) {
    await this.persistentSet(HEAD_KEY, key);
    return;
  }

  private async setTailKey(key: string) {
    await this.persistentSet(TAIL_KEY, key);
    return;
  }

  private async setHead(node: LruNode) {
    const headId = await this.getHeadKey();
    node.nextKey = headId;
    node.prevKey = null;

    const head = await this.getHeadNode(headId);
    if (head) {
      head.prevKey = node.key;
      await head.save(this.persistentSet);
    }
    await this.setHeadKey(node.key);
    const tail = await this.getTailNode();
    if (!tail) {
      await this.setTailKey(node.key);
    }
    await this.setSize((await this.getSize()) + 1);
    await node.save(this.persistentSet);
  }
}
