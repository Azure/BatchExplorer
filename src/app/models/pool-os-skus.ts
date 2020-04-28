import { ObjectUtils } from "@batch-flask/utils";
import { List } from "immutable";
import { ImageInformation } from "./image-information";
import { ImageReference } from "./image-reference";

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
    "windowsserver": [
        "2016-datacenter-with-containers",
        "2019-datacenter-with-containers",
        "2019-datacenter-with-containers-smalldisk",
        "2019-datacenter-core-with-containers",
        "2019-datacenter-core-with-containers-smalldisk",
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
            let imageReference = image.imageReference;
            // Do some manual cleanup here as some images made breaking name changes
            // (causes UI to not collate same offer)
            if (imageReference.offer.includes("dsvm-win")) {
                imageReference = new ImageReference({
                    publisher: imageReference.publisher,
                    sku: imageReference.sku,
                    offer: "dsvm-windows",
                    version: imageReference.version,
                    virtualMachineImageId: imageReference.virtualMachineImageId,
                });
            } else if (imageReference.publisher === "microsoft-dsvm" && (imageReference.offer.includes("ubuntu"))) {
                imageReference = new ImageReference({
                    publisher: imageReference.publisher,
                    sku: imageReference.sku,
                    offer: "linux-data-science-vm-ubuntu",
                    version: imageReference.version,
                    virtualMachineImageId: imageReference.virtualMachineImageId,
                });
            } else if (imageReference.offer === "windowsserversemiannual") {
                imageReference = new ImageReference({
                    publisher: imageReference.publisher,
                    sku: imageReference.sku,
                    offer: "windowsserver",
                    version: imageReference.version,
                    virtualMachineImageId: imageReference.virtualMachineImageId,
                });
            } else if (imageReference.offer === "debian-10") {
                imageReference = new ImageReference({
                    publisher: imageReference.publisher,
                    sku: imageReference.sku,
                    offer: "debian",
                    version: imageReference.version,
                    virtualMachineImageId: imageReference.virtualMachineImageId,
                });
            }
            if (imageReference.sku === "linuxdsvmubuntu" && image.nodeAgentSKUId.includes("16.04")) {
                imageReference = new ImageReference({
                    publisher: imageReference.publisher,
                    sku: "16.04",
                    offer: imageReference.offer,
                    version: imageReference.version,
                    virtualMachineImageId: imageReference.virtualMachineImageId,
                });
            }
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
        this.vmOffers = this.allOffers.filter(x => !(x.name in dataScienceVms) && x.publisher !== renderingPublisher);
        this.dataScienceOffers = this.allOffers
            .filter(x => (x.name in dataScienceVms) && x.publisher !== renderingPublisher);
        this.dockerOffers = ObjectUtils.values(dockerOffers);
    }
}
