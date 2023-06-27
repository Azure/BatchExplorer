import { ListProp, Prop, Record } from "@batch-flask/core";
import { List } from "immutable";

export interface ServicePrincipalAttributes {
    id: string;
    accountEnabled: boolean;
    appDisplayName: string;
    appId: string;
    appOwnerOrganizationId: string;
    appRoleAssignmentRequired: boolean;
    displayName: string;
    errorUrl: string;
    homepage: string;
    logoutUrl: string;
    publisherName: string;
    tags: string[];
}

export class ServicePrincipal extends Record<ServicePrincipalAttributes> {
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
    @ListProp(String) public tags: List<string>;

    constructor(data) {
        super({
            ...data,
            id: data.objectId,
        });
    }
}
