import { List, Record } from "immutable";

import { ApplicationPackage } from "app/models";
import { Partial } from "app/utils";

const ApplicationRecord = Record({
    id: null,
    displayName: null,
    allowUpdates: false,
    defaultVersion: null,
    packages: null,
});

export interface ApplicationAttributes {
    id: string;
    displayName: string;
    allowUpdates: boolean;
    defaultVersion: string;
    packages: List<ApplicationPackage>;
}

/**
 * Class for displaying Batch application information.
 */
export class Application extends ApplicationRecord implements ApplicationAttributes {
    public id: string;
    public displayName: string;
    public allowUpdates: boolean;
    public defaultVersion: string;
    public packages: List<ApplicationPackage>;

    constructor(data: Partial<ApplicationAttributes> = {}) {
        super(Object.assign({}, data, {
            packages: List(data.packages),
        }));
    }
}
