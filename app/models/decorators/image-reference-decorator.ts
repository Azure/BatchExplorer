import { ImageReference } from "app/models";
import { DecoratorBase } from "app/utils/decorators";

export class ImageReferenceDecorator extends DecoratorBase<ImageReference> {
    public publisher: string;
    public offer: string;
    public sku: string;
    public version: string;
    public virtualMachineImageId: string;

    constructor(imageReference: ImageReference) {
        super(imageReference);

        this.publisher = this.stringField(imageReference.publisher);
        this.offer = this.stringField(imageReference.offer);
        this.sku = this.stringField(imageReference.sku);
        this.version = this.stringField(imageReference.version);
        this.virtualMachineImageId = this.stringField(imageReference.virtualMachineImageId);
    }
}
