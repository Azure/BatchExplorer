import { List } from "immutable";

import { NodeAgentSku } from "./node-agent-sku";

export class NodeAgentSkuMap {
    private _map: any;

    constructor(skus: List<NodeAgentSku> = List([])) {
        let map = {};
        skus.forEach((sku) => {
            for (let imageReference of sku.verifiedImageReferences) {
                if (!map[imageReference.publisher]) {
                    map[imageReference.publisher] = {};
                }

                if (!map[imageReference.publisher][imageReference.offer]) {
                    map[imageReference.publisher][imageReference.offer] = {};
                }

                if (!map[imageReference.publisher][imageReference.offer][imageReference.sku]) {
                    map[imageReference.publisher][imageReference.offer][imageReference.sku] = {
                        nodeAgentId: sku.id,
                        osType: sku.osType,
                    };
                }
            }
        });
        this._map = map;
    }


    public getPublisher(publisher: string) {
        return this._map[publisher];
    }

    public getOffer(publisher: string, offer: string) {
        const data = this._map[publisher];
        return data && data[offer];
    }

    public getSku(publisher: string, offer: string, sku: string) {
        const data = this.getOffer(publisher, offer);
        return data && data[sku];
    }

    public getPublishers() {
        return Object.keys(this._map);
    }

    public getOffers(publisher: string) {
        const data = this.getPublisher(publisher);
        return data ? Object.keys(data) : [];
    }

    public getSkus(publisher: string, offer: string) {
        const data = this.getOffer(publisher, offer);
        return data ? Object.keys(data) : [];
    }

    public getNodeAgentId(publisher: string, offer: string, sku: string) {
        const data = this.getSku(publisher, offer, sku);
        return data ? Object.keys(data) : [];
    }
}
