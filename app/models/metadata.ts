import { Record } from "immutable";


const MetadataRecord = Record({
    name: null,
    value: null,
});

export interface MetadataAttributes {
    name: string;
    value: string;
};

export class Metadata extends MetadataRecord {
    public name: string;
    public value: string;
}
