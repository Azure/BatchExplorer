import { DecoratorBase } from "../../utils/decorators";
import { ImageReference } from "../imageReference";

export class ImageReferenceDecorator extends DecoratorBase<ImageReference> {
    public publisher: string;
    public offer: string;
    public sku: string;
    public version: string;

    constructor(private imageReference: ImageReference) {
        super(imageReference);

        this.publisher = this.stringField(imageReference.publisher);
        this.offer = this.stringField(imageReference.offer);
        this.sku = this.stringField(imageReference.sku);
        this.version = this.stringField(imageReference.version);
    }
}
