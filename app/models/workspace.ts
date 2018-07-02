import { WorkspaceDefinition } from "./workspace-definition";

export class Workspace {
    public id: string;
    public name: string;

    public constructor(workspace: WorkspaceDefinition) {
        console.log("Workspace.constructor: ", workspace);
        this.id = workspace.metadata.id;
        this.name = workspace.metadata.displayName;
    }

    public isFeatureEnabled(feature: string): boolean {
        return true;
    }

    public isFeatureDisabled(feature: string): boolean {
        return false;
    }
}
