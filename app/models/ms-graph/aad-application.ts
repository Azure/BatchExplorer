import { ListProp, Prop, Record } from "app/core";
import { List } from "immutable";

import { PasswordCredentials, PasswordCredentialsAttributes } from "./password-credentials";

export interface AADApplicationAttributes {
    id: string;
    displayName: string;
    deletedDateTime: Date;
    allowPublicClient: boolean;
    createdDateTime: Date;
    publicClient: boolean;
    tags: string[];
    passwordCredentials: PasswordCredentialsAttributes[];
}

export class AADApplication extends Record<AADApplicationAttributes> {
    @Prop() public id: string;
    @Prop() public accountEnabled: boolean;
    @Prop() public appDisplayName: string;
    @Prop() public appId: string;
    @Prop() public appOwnerOrganizationId: string;
    @Prop() public appRoleAssignmentRequired: boolean;
    @Prop() public displayName: string;
    @Prop() public errorUrl: string;
    @Prop() public homepage: string;
    @Prop() public logoutUrl: string;
    @Prop() public publisherName: string;
    @Prop() public publicClient: boolean;
    @ListProp(String) public tags: List<string>;
    @ListProp(PasswordCredentials) public passwordCredentials: List<PasswordCredentials>;

    constructor(data) {
        super({
            ...data,
            id: data.appId,
        });
    }

    public get isApiApp(): boolean {
        return !this.publicClient;
    }

    public get isNativeApp(): boolean {
        return Boolean(this.publicClient);
    }
}
