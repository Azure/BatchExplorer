export interface RoleDefinitionPermission {
    actions: string[];
    noActions: string[];
}

export enum BatchAccountPermission {
    Read = "*/read",
    ReadWrite = "*",
}
