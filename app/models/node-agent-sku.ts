import { Record } from "immutable";

// tslint:disable:variable-name object-literal-sort-keys
const NodeAgentSkuRecord = Record({
    id: null,
    verifiedImageReference: null,
    osType: null,
});

/**
 * Class for displaying Batch Node Agent SKU information.
 */
export class NodeAgentSku extends NodeAgentSkuRecord {
    public id: string;
    public verifiedImageReference: any;
    public osType: string;
}
