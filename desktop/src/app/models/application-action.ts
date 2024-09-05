import { Model, Record, Prop } from "@batch-flask/core/record";

export interface ApplicationActionAttributes {
    id: string;
    name: string;
    description: string;
}

/**
 * Class for displaying Batch application information.
 */
@Model()
export class ApplicationAction extends Record<ApplicationActionAttributes> {
    @Prop() public id: string;
    @Prop() public name: string;
    @Prop() public description: string;
}
