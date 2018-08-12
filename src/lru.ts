const store: any = {};

export class PLRU {
  private limit: number;

  constructor(limit: number) {
    this.limit = limit;
  }

  public showAll() {
    console.log(JSON.stringify(store, null, 2));
  }

  public async init() {
    if (await this.isFreshCache()) {
      await this.initMetaData();
      return;
    }
  }

  private async isFreshCache() {
    const [size, headId, tailId] = await Promise.all([
      this.getSize(),
      this.getHeadId(),
      this.getTailId()
    ]);
    if (size || headId || tailId) {
      return false;
    } else {
      return true;
    }
  }

  private initMetaData() {
    return Promise.all([
      this.setSize(0),
      this.setHeadId(null),
      this.setTailId(null)
    ]);
  }

  private setSize(size: number): PromiseLike<number> {
    return new Promise(resolve => {
      store.__size = size;
      resolve();
    });
  }

  private getSize(): PromiseLike<number> {
    return new Promise(resolve => resolve(store.__size || 0));
  }

  private getHeadId(): PromiseLike<string> {
    return new Promise(resolve => {
      resolve(store.__headId);
    });
  }
  private async getHead(id?: string) {
    const headId = id || (await this.getHeadId());
    return LruNode.find(headId);
  }

  private getTailId(): PromiseLike<string> {
    return new Promise(resolve => {
      resolve(store.__tailId);
    });
  }

  private async getTail(id?: string) {
    const tailId = id || (await this.getTailId());
    return LruNode.find(tailId);
  }

  private async setHeadId(id: string) {
    return (store.__headId = id);
  }

  private async setTailId(id: string) {
    return (store.__tailId = id);
  }

  private async setHead(node: LruNode) {
    const headId = await this.getHeadId();
    node.nextId = headId;
    node.prevId = null;

    const head = await this.getHead(headId);
    if (head) {
      head.prevId = node.id;
      await head.save();
    }
    await this.setHeadId(node.id);
    const tail = await this.getTail();
    if (!tail) {
      await this.setTailId(node.id);
    }
    await this.setSize((await this.getSize()) + 1);
    await node.save();
  }

  public async set(id: string, val: any) {
    const node = new LruNode(id, val);
    const foundNode = await LruNode.find(id);
    if (foundNode) {
      await LruNode.remove(foundNode.id);
    } else {
      const currentCacheSize = await this.getSize();
      if (currentCacheSize >= this.limit) {
        const tailNode = await this.getTail();
        await LruNode.remove(tailNode.id);
        await this.setSize(currentCacheSize - 1);
        await this.setTailId(tailNode.prevId);
        const newTail = await this.getTail(tailNode.prevId);
        if (newTail) {
          newTail.nextId = null;
          await newTail.save();
        }
      }
    }
    await this.setHead(node);
  }

  public async get(id: string) {
    const foundNode = await LruNode.find(id);

    if (foundNode) {
      const val = foundNode.val;
      const node = new LruNode(id, val);
      await LruNode.remove(id);
      await this.setHeadId(node.id);
      return val;
    } else {
      console.log(`Key ${id} not stored in cache`);
      return undefined;
    }
  }

  public async remove(id: string) {
    const node = await LruNode.find(id);
    const nodePrevNode = await LruNode.find(node.prevId);
    const nodeNextNode = await LruNode.find(node.nextId);

    if (nodePrevNode) {
      nodePrevNode.nextId = node.nextId;
    } else {
      await this.setHeadId(nodeNextNode.id);
    }
    if (nodeNextNode) {
      nodeNextNode.prevId = node.prevId;
    } else {
      this.setTailId(nodePrevNode.id);
    }
    await nodePrevNode.save();
    await nodeNextNode.save();
    await LruNode.remove(node.id);
    return node;
  }
}

class LruNode {
  public nextId: string;
  public prevId: string;
  public val: any;
  public id: string;

  constructor(
    id: string,
    val: any,
    nextId: string = null,
    prevId: string = null
  ) {
    this.id = id;
    this.val = val;
    this.nextId = nextId;
    this.prevId = prevId;
  }

  public save(): PromiseLike<LruNode> {
    return new Promise(resolve => {
      store[this.id] = {
        id: this.id,
        val: this.val,
        nextId: this.nextId,
        prevId: this.prevId
      };
      resolve();
    });
  }
  public static remove(id: string): PromiseLike<LruNode> {
    return new Promise(resolve => {
      const node = store[id];
      delete store[id];
      resolve(node);
    });
  }
  public static find(gottenId: string): PromiseLike<LruNode> {
    return new Promise(resolve => {
      const data = store[gottenId];
      if (data) {
        const node = new LruNode(data.id, data.val, data.nextId, data.prevId);
        return resolve(node);
      }
      resolve(null);
    });
  }
}
