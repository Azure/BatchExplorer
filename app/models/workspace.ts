import { WorkspaceDefinition, WorkspaceSettings } from "./workspace-definition";

export class Workspace {
    public id: string;
    public name: string;
    public workspace: WorkspaceSettings;

    public constructor(definition: WorkspaceDefinition) {
        this.id = definition.metadata.id;
        this.name = definition.metadata.displayName;
        this.workspace = definition.workspace;
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
