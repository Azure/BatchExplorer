import { Record } from "immutable";

const ApplicationPackageRecord = Record({
    version: null,
    state: null,
    format: false,
    lastActivationTime: null,
    storageUrl: null,
    storageUrlExpiry: null,
});

/**
 * Class for displaying Batch application package information.
 */
export class ApplicationPackage extends ApplicationPackageRecord {
    public version: string;
    public state: PackageState;
    public format: string;
    public lastActivationTime: Date;
    public storageUrl: string;
    public storageUrlExpiry: Date;

    constructor(data: any = {}) {
        super(Object.assign({}, data, {  }));
    }
}

export type PackageState = "active" | "pending";
export const PackageState = {
    active: "active" as PackageState,
    disabling: "pending" as PackageState,
};
