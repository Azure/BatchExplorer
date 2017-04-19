import { List } from "immutable";

import { ObjectUtils } from "app/utils";
import { NodeAgentSku } from "./node-agent-sku";

const dataScienceVms = {
    "linux-data-science-vm": {
        osType: "linux",
    },
    "standard-data-science-vm": {
        osType: "windows",
    },
};

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
    public allOffers: Offer[];
    public vmOffers: Offer[];
    public dataScienceOffers: Offer[];

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
        this.allOffers = ObjectUtils.values(offers);
        this.vmOffers = this.allOffers.filter(x => !(x.name in dataScienceVms));
        this.dataScienceOffers = this.allOffers.filter(x => (x.name in dataScienceVms));
    }
}
