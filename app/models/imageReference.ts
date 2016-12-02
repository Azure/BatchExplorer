import { Record } from "immutable";

// tslint:disable:variable-name object-literal-sort-keys
const ImageReferenceRecord = Record({
    publisher: null,
    offer: null,
    sku: null,
    version: null,
});

/**
 * Class for displaying Batch ImageReference information.
 */
export class ImageReference extends ImageReferenceRecord {
    public publisher: string;
    public offer: string;
    public sku: string;
    public version: string;
}
