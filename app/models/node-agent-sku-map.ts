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
}
