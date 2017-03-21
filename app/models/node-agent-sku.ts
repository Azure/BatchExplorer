import { Record } from "immutable";

const NodeAgentSkuRecord = Record({
    id: null,
    verifiedImageReferences: null,
    osType: null,
});

/**
 * Class for displaying Batch Node Agent SKU information.
 */
export class NodeAgentSku extends NodeAgentSkuRecord {
    public id: string;
    public verifiedImageReferences: any[];
    public osType: string;
}
