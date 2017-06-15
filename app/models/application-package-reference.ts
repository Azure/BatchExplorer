import { Model, Prop, Record } from "app/core";

export interface ApplicationPackageReferenceAttributes {
    applicationId: string;
    version: string;
}

/**
 * A reference to an application package to be deployed to a compute nodes
 */
@Model()
export class ApplicationPackageReference extends Record<ApplicationPackageReferenceAttributes> {
    @Prop() public applicationId: string;
    @Prop() public version: string;
}
