import { Model, Record, Prop } from "@batch-flask/core/record";

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
