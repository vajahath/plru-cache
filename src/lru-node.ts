interface INodeDetails {
  key: string;
  val: any;
  nextKey?: string;
  prevKey?: string;
}

export class LruNode {
  public nextKey: string;
  public prevKey: string;
  public val: any;
  public key: string;

  constructor(NodeDetails: INodeDetails) {
    this.key = NodeDetails.key;
    this.val = NodeDetails.val;
    this.nextKey = NodeDetails.nextKey || null;
    this.prevKey = NodeDetails.prevKey || null;
  }
}
