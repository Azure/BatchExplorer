
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

    /**
     * Check a requested feature against the workspace definition.
     * requestedFeature can contain multiple features separated by
     * a '|' character. e.g. pool.graphs.insights|pool.graphs.tasks
     */
    public isFeatureEnabled(requestedFeature: string): boolean {
        // no feature supplied, default to visible
        if (!requestedFeature) { return true; }

        const features = requestedFeature.split("|");
        for (const feature of features) {
            const result = this._checkFeatureParts(feature);
            if (result) {
                return true;
            }
        }

        return false;
    }

    private _checkFeatureParts(feature: string) {
        const featureParts = feature.split(".");
        let definition = this.template;
        for (const part of featureParts) {
            definition = definition[part];
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
