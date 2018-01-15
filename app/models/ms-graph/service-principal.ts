import { ListProp, Prop, Record } from "app/core";
import { List } from "immutable";

export interface ServicePrincipalAttributes {
    accountEnabled: boolean;
    appDisplayName: string;
    appId: string;
    appOwnerOrganizationId: string;
    appRoleAssignmentRequired: boolean;
    displayName: string;
    errorUrl: string;
    homepage: string;
    id: string;
    logoutUrl: string;
    publisherName: string;
    tags: string[];
}

export class ServicePrincipal extends Record<ServicePrincipalAttributes> {
    @Prop() public accountEnabled: boolean;
    @Prop() public appDisplayName: string;
    @Prop() public appId: string;
    @Prop() public appOwnerOrganizationId: string;
    @Prop() public appRoleAssignmentRequired: boolean;
    @Prop() public displayName: string;
    @Prop() public errorUrl: string;
    @Prop() public homepage: string;
    @Prop() public id: string;
    @Prop() public logoutUrl: string;
    @Prop() public publisherName: string;
    @ListProp(String) public tags: List<string>;
}
