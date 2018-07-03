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
        return true;
    }

    // TODO: unsure if we need this one, as its probably just the inverse of the above
    // I.E isFeatureEnabled("pool") === false
    public isFeatureDisabled(feature: string): boolean {
        return false;
    }
}
