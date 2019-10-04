import { ObjectUtils } from "@batch-flask/utils";
import { List } from "immutable";
import { ImageInformation } from "./image-information";

const dataScienceVms = {
    "linux-data-science-vm": {
        osType: "linux",
    },
    "linux-data-science-vm-ubuntu": {
        osType: "linux",
    },
    "standard-data-science-vm": {
        osType: "windows",
    },
    "dsvm-windows": {
        osType: "windows",
    },
};

const renderingPublisher = "batch";

// Docker container supported os
const dockerContainer = {
    "WindowsServer": [
        "2016-Datacenter-with-Containers",
        "2019-Datacenter-with-Containers",
        "2019-Datacenter-with-Containers-smalldisk",
        "2019-Datacenter-Core-with-Containers",
        "2019-Datacenter-Core-with-Containers-smalldisk",
    ],
    "centos-container-rdma": true,
    "centos-container": true,
    "ubuntu-server-container": true,
    "ubuntu-server-container-rdma": true,
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

export class PoolOsSkus {
    public allOffers: Offer[];
    public vmOffers: Offer[];
    public dataScienceOffers: Offer[];
    public renderingOffers: Offer[];
    public dockerOffers: Offer[];

    constructor(images: List<ImageInformation> = List([])) {
        const offers: StringMap<Offer> = {};
        const dockerOffers: StringMap<Offer> = {};
        /**
         * Split current offer to normal offer and docker offer because some docker container must be displayed
         * in a seperate container configuration tab
         */
        let targetOffers: StringMap<Offer> | null = null;
        images.forEach((image: ImageInformation) => {
            if (image.verificationType === "verified") {
                const imageReference =  image.imageReference;
                targetOffers = offers;
                if (dockerContainer[imageReference.offer]
                    && (dockerContainer[imageReference.offer] === true
                        || dockerContainer[imageReference.offer].includes(imageReference.sku))) {
                    targetOffers = dockerOffers;
                }
                if (!(imageReference.offer in targetOffers)) {
                    targetOffers[imageReference.offer] = {
                        name: imageReference.offer,
                        publisher: imageReference.publisher,
                        skus: [],
                    };
                }
                const offer = targetOffers[imageReference.offer];
                offer.skus.push({
                    name: imageReference.sku,
                    nodeAgentId: image.nodeAgentSKUId,
                    osType: image.osType,
                });
            }
        });

        this.allOffers = ObjectUtils.values(offers);
        this.renderingOffers = this.allOffers.filter(x => x.publisher === renderingPublisher);
        this.vmOffers = this.allOffers.filter(x => !(x.name in dataScienceVms) && x.publisher !== renderingPublisher);
        this.dataScienceOffers = this.allOffers
            .filter(x => (x.name in dataScienceVms) && x.publisher !== renderingPublisher);
        this.dockerOffers = ObjectUtils.values(dockerOffers);
    }
}
