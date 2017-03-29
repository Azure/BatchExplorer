import { List } from "immutable";

import { ObjectUtils } from "app/utils";
import { NodeAgentSku } from "./node-agent-sku";

export interface Sku {
    name: string;
    nodeAgentId: string;
    osType: string;
}

export interface Offer {
    name: string;
    publisher: string;
    skus: Sku[];
}

export class NodeAgentSkuMap {
    public offers: Offer[];

    constructor(skus: List<NodeAgentSku> = List([])) {
        let offers: StringMap<Offer> = {};
        skus.forEach((sku) => {
            for (let imageReference of sku.verifiedImageReferences) {
                if (!(imageReference.offer in offers)) {
                    offers[imageReference.offer] = {
                        name: imageReference.offer,
                        publisher: imageReference.publisher,
                        skus: [],
                    };
                }
                const offer = offers[imageReference.offer];
                offer.skus.push({
                    name: imageReference.sku,
                    nodeAgentId: sku.id,
                    osType: sku.osType,
                });
            }
        });
        this.offers = ObjectUtils.values(offers);
    }

    // public getPublisher(publisher: string) {
    //     return this._map[publisher];
    // }

    // public offer(publisher: string, offer: string) {
    //     const data = this._map[publisher];
    //     return data && data[offer];
    // }

    // public getSku(publisher: string, offer: string, sku: string) {
    //     const data = this.getOffer(publisher, offer);
    //     return data && data[sku];
    // }

    // public getPublishers() {
    //     return Object.keys(this._map);
    // }

    // public getOffers(publisher: string) {
    //     const data = this.getPublisher(publisher);
    //     return data ? Object.keys(data) : [];
    // }

    // public getSkus(publisher: string, offer: string) {
    //     const data = this.getOffer(publisher, offer);
    //     return data ? Object.keys(data) : [];
    // }

    // public getNodeAgentId(publisher: string, offer: string, sku: string) {
    //     const data = this.getSku(publisher, offer, sku);
    //     return data ? data.nodeAgentId : "";
    // }
}
