
/**
 * Class for displaying Batch account information.
 * We use this for authenticating requests to the Batch API.
 */
export class Account {
    public id: string;
    public alias: string;
    public name: string;
    public url: string;
    public key: string;
    public isDefault: boolean;

    // TODO make a parent model class for all model where you can assign attributes with a hash
    constructor(alias?: string, name?: string, url?: string, key?: string, isDefault?: boolean) {
        this.alias = alias;
        this.name = name;
        this.url = url;
        this.key = key;
        this.isDefault = isDefault;
    }
}
