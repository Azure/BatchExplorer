import { ObjectUtils } from "@batch-flask/utils";
import { List } from "immutable";
<<<<<<< HEAD
import { ImageInformation } from "./image-information";
import { ImageReference } from "./image-reference";
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
    "dsvm-win-2019": {
        osType: "windows",
    },
};

const renderingPublisher = "batch";

// Docker container supported os
const dockerContainer = {
    "windowsserver": [
        "2016-datacenter-with-containers",
        "2019-datacenter-with-containers",
        "2019-datacenter-with-containers-smalldisk",
        "2019-datacenter-core-with-containers",
        "2019-datacenter-core-with-containers-smalldisk",
        "datacenter-core-1903-with-containers-smalldisk",
    ],
    "windowsserversemiannual": ["datacenter-core-1809-with-containers-smalldisk"],
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
        //  TODO: Eventually we should have either a check box (similar to portal) specifying whether to load
        //        unverified images, or add some visual indicator to those which are unverified.
        let targetOffers: StringMap<Offer> | null = null;
        images.forEach((image: ImageInformation) => {
            const imageReference = image.imageReference;
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
        });

        this.allOffers = ObjectUtils.values(offers);
        this.renderingOffers = this.allOffers.filter(x => x.publisher === renderingPublisher);
        this.dataScienceOffers = this.allOffers.filter(x =>
            ((x.name in dataScienceVms) || x.publisher === "microsoft-dsvm") && !(this.renderingOffers.includes(x)));
        this.vmOffers = this.allOffers.filter(x =>
            !(this.renderingOffers.includes(x) || this.dataScienceOffers.includes(x)));
        this.dockerOffers = ObjectUtils.values(dockerOffers);
    }
}
