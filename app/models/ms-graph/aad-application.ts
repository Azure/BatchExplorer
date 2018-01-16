import { ListProp, Prop, Record } from "app/core";
import { List } from "immutable";

export interface AADApplicationAttributes {
    id: string;
    displayName: string;
    deletedDateTime: Date;
    allowPublicClient: boolean;
    createdDateTime: Date;
    tags: string[];
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
    @ListProp(String) public tags: List<string>;
}
