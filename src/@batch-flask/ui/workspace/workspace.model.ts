
/**
 * Define the visiblity state of certain components in the UI
 */
export interface WorkspaceDefinition {
    id: string;
    displayName: string;
    description: string;
    features: FeatureDefinition;
}

export interface FeatureDefinition {

}

export class Workspace {
    public id: string;
    public name: string;
    public template: FeatureDefinition;

    public constructor(definition: WorkspaceDefinition) {
        this.id = definition.id;
        this.name = definition.displayName;
        this.template = definition.features;
    }

    public isFeatureEnabled(requestedFeature: string): boolean {
        // no feature supplied, default to visible
        if (!requestedFeature) { return true; }

        const features = requestedFeature.split(".");
        // console.log(`Workspace.isFeatureEnabled: ${requestedFeature}`, this.template);

        let definition = this.template;
        for (const feat of features) {
            definition = definition[feat];
            if (definition === true) {
                return true;
            } else if (definition === undefined) {
                return true;
            } else if (definition === false) {
                return false;
            }
        }

        return definition === false ? false : true;
    }
}
