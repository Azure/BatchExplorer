import { BatchRequestOptions } from "./models";
import { GetProxy, ListProxy }  from "./shared";

export default class NodeProxy {
    private _getProxy: GetProxy;

    constructor(private client: any) {
        this._getProxy = new GetProxy(this.client.computeNodeOperations);
    }

    public list(poolId: string, options?: BatchRequestOptions) {
        return new ListProxy(this.client.computeNodeOperations, [poolId], { computeNodeListOptions: options });
    }

    public get(poolId: string, nodeId: string, options?: BatchRequestOptions) {
        return this._getProxy.execute([poolId, nodeId], { computeNodeGetOptions: options });
    }
}
