import { EnvironmentSetting } from "./metadata.dto";

export interface TaskCreateDto {
    id: string;
    displayName?: string;
    commandLine: string;
    resourceFiles?: ResourceFileDto[];
    applicationPackageReferences?: ApplicationPackageReferenceDto[];
    environmentSettings?: EnvironmentSetting[];
    affinityInfo?: any;
    runElevated?: boolean;
    multiInstanceSettings?: any;
    dependsOn?: any;
    exitConditions?: any;
}

export interface ResourceFileDto {
    blobSource: string;
    filePath: string;
    fileMode?: string;
}

export interface ApplicationPackageReferenceDto {
    applicationId: string;
    version?: string;
}
