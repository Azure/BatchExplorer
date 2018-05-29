import { List } from "immutable";

import { BlobContainer, Metadata } from "app/models";
import { DecoratorBase } from "app/utils/decorators";
import { ContainerLeaseDecorator } from "./container-lease-decorator";

export class ContainerDecorator extends DecoratorBase<BlobContainer> {
    public id: string;
    public name: string;
    public publicAccessLevel: string;
    public lastModified: string;
    public lease: any;
    public metadata: any;

    constructor(container: BlobContainer) {
        super(container);

        this.id = this.stringField(container.id);
        this.name = this.stringField(container.name);
        this.publicAccessLevel = this.stringField(container.publicAccessLevel);
        this.lastModified = this.dateField(container.lastModified);
        this.lease = new ContainerLeaseDecorator(container.lease || {} as any);
        this.metadata = this._buildMetadata(container.metadata);
    }

    private _buildMetadata(metadata: Map<string, string>): List<Metadata> {
        const metaArray = [];
        if (metadata) {
            for (const key of Object.keys(metadata)) {
                metaArray.push(new Metadata({ name: key, value: metadata[key] }));
            }
        }

        return List<Metadata>(metaArray);
    }
}
