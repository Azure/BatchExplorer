export interface WorkspaceMetaData {
    id: string;
    displayName: string;
    description: string;
}

// TODO: expand on these.
export interface WorkspaceSettings {
    job: any;
    schedule: any;
    pool: any;
    package: any;
    certificate: any;
    data: any;
    gallery: any;
}

/**
 * Define the visible state of conponents in the UI
 */
export interface WorkspaceDefinition {
    id: WorkspaceMetaData["id"];
    displayName: WorkspaceMetaData["displayName"];
    description: WorkspaceMetaData["displayName"];
    features: WorkspaceSettings;
}
