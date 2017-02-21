import { Record } from "immutable";

import { Partial } from "app/utils";

const ApplicationPackageRecord = Record({
    version: null,
    state: null,
    format: false,
    lastActivationTime: null,
    storageUrl: null,
    storageUrlExpiry: null,
});

export interface ApplicationPackageAttributes {
    version: string;
    state: PackageState;
    format: string;
    lastActivationTime: Date;
    storageUrl: string;
    storageUrlExpiry: Date;
}

/**
 * Class for displaying Batch application package information.
 */
export class ApplicationPackage extends ApplicationPackageRecord implements ApplicationPackageAttributes {
    public version: string;
    public state: PackageState;
    public format: string;
    public lastActivationTime: Date;
    public storageUrl: string;
    public storageUrlExpiry: Date;

    constructor(data: Partial<ApplicationPackageAttributes> = {}) {
        super(Object.assign({}, data, {  }));
    }
}

export type PackageState = "active" | "pending";
export const PackageState = {
    active: "active" as PackageState,
    pending: "pending" as PackageState,
};
