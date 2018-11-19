import { Model, Prop, Record } from "@batch-flask/core";

export interface ApplicationAttributes {
    id: string;
    name: string;
    description: string;
    icon: string;
    readme: string;
}

/**
 * Class for displaying Batch application information.
 */
@Model()
export class Application extends Record<ApplicationAttributes> {
    @Prop() public id: string;
    @Prop() public name: string;
    @Prop() public description: string;

    /**
     * Path to the icon svg
     */
    @Prop() public icon: string;

    /**
     * Path to the readme file.
     */
    @Prop() public readme: string;
    @Prop() public portfolioId: string;
}
