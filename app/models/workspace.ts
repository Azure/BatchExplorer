import { FeatureDefinition, WorkspaceDefinition } from "./workspace-definition";

export class Workspace {
    public id: string;
    public name: string;
    public features: FeatureDefinition;

    public constructor(definition: WorkspaceDefinition) {
        this.id = definition.id;
        this.name = definition.displayName;
        this.features = definition.features;
    }

    public isFeatureEnabled(feature: string): boolean {
        console.log(`Workspace.isFeatureEnabled: ${feature}`, this.features);
        return Boolean(this.features[feature]);
    }
}
