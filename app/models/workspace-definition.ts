
export interface WorkspaceMetaData {
    id: string;
    displayName: string;
    description: string;
}

/**
 * Define the visibale state of conponents in the UI
 */
export interface WorkspaceDefinition {
    metadata: WorkspaceMetaData;
    workspace: any;
}
