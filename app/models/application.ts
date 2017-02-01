import { Record } from "immutable";

import { ApplicationPackage } from "./applicationPackage";

const ApplicationRecord = Record({
    id: null,
    displayName: null,
    allowUpdates: false,
    defaultVersion: null,
    packages: null,
});

/**
 * Class for displaying Batch application information.
 */
export class Application extends ApplicationRecord {
    public id: string;
    public displayName: string;
    public allowUpdates: boolean;
    public defaultVersion: string;
    public packages: ApplicationPackage[];

    constructor(data: any = {}) {
        super(Object.assign({}, data, {  }));
    }
}
