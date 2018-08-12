import { IOptions } from "./conf";
import { LRU_BASE } from "./lru-base";
import { LruNode } from "./lru-node";

const CACHE_SIZE = "__@cache_size_";
const HEAD_KEY = "__@cache_head_key_";
const TAIL_KEY = "__@cache_tail_key_";

export class LRU extends LRU_BASE {
  private store: any = null;

  constructor(options: IOptions) {
    super(options);
    if (
      !options.persistentGet &&
      !options.persistentDel &&
      !options.persistentSet
    ) {
      // no outside store. so use default store
      this.store = {};
    }
  }

  public async init() {
    if (await this.isFreshCache()) {
      await this.initMetaData();
      return;
    }
  }

  public async set(key: string, val: any) {
    const node = new LruNode({ key, val });
    const foundNode = await this.findNode(key);
    if (foundNode) {
      await this.delNode(foundNode.key);
    } else {
      const currentCacheSize = await this.getSize();
      if (currentCacheSize >= this.limit) {
        const tailNode = await this.getTailNode();
        await this.delNode(tailNode.key);
        await this.setSize(currentCacheSize - 1);
        await this.setTailKey(tailNode.prevKey);
        const newTail = await this.getTailNode(tailNode.prevKey);
        if (newTail) {
          newTail.nextKey = null;
          await this.saveNode(newTail);
        }
      }
    }
    await this.setHead(node);
  }

  public async get(key: string) {
    const foundNode = await this.findNode(key);

    if (foundNode) {
      const val = foundNode.val;
      const node = new LruNode({ key, val });
      await this.delNode(key);
      await this.setHeadKey(node.key);
      return val;
    } else {
      // console.log(`Key ${key} not stored in cache`);
      return undefined;
    }
  }

  public async remove(key: string) {
    const node = await this.findNode(key);
    const nodePrevNode = await this.findNode(node.prevKey);
    const nodeNextNode = await this.findNode(node.nextKey);

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
    await this.saveNode(nodePrevNode);
    await this.saveNode(nodeNextNode);
    await this.delNode(node.key);
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
    await this.persistentSet.call(this, CACHE_SIZE, size);
    return;
  }

  private async getSize(): Promise<number> {
    const size = await this.persistentGet.call(this, CACHE_SIZE);
    return size;
  }

  private async getHeadKey(): Promise<string> {
    const headKey = await this.persistentGet.call(this, HEAD_KEY);
    return headKey;
  }

  private async findNode(key: string): Promise<LruNode> {
    const node = await this.persistentGet.call(this, key);
    if (node) {
      return new LruNode(node);
    } else {
      return null;
    }
  }

  private async saveNode(node: LruNode): Promise<void> {
    await this.persistentSet.call(this, node.key, node);
  }

  private async delNode(key: string): Promise<LruNode> {
    const node = await this.persistentGet.call(this, key);
    await this.persistentDel.call(this, key);
    if (node) {
      return new LruNode(node);
    } else {
      return null;
    }
  }

  private async getHeadNode(key?: string) {
    const headKey = key || (await this.getHeadKey());
    const headNode = await this.findNode(headKey);
    return headNode;
  }

  private async getTailKey(): Promise<string> {
    const tailKey = await this.persistentGet.call(this, TAIL_KEY);
    return tailKey;
  }

  private async getTailNode(key?: string) {
    const tailKey = key || (await this.getTailKey());
    const tailNode = await this.findNode(tailKey);
    return tailNode;
  }

  private async setHeadKey(key: string) {
    await this.persistentSet.call(this, HEAD_KEY, key);
    return;
  }

  private async setTailKey(key: string) {
    await this.persistentSet.call(this, TAIL_KEY, key);
    return;
  }

  private async setHead(node: LruNode) {
    const headId = await this.getHeadKey();
    node.nextKey = headId;
    node.prevKey = null;

    const head = await this.getHeadNode(headId);
    if (head) {
      head.prevKey = node.key;
      await this.saveNode(head);
    }
    await this.setHeadKey(node.key);
    const tail = await this.getTailNode();
    if (!tail) {
      await this.setTailKey(node.key);
    }
    await this.setSize((await this.getSize()) + 1);
    await this.saveNode(node);
  }
}
