import { Dto, DtoAttr } from "app/core";
import { EnvironmentSetting } from "./metadata.dto";

export class TaskCreateDto extends Dto<TaskCreateDto> {
    @DtoAttr()
    public id: string;

    @DtoAttr()
    public displayName?: string;

    @DtoAttr()
    public commandLine: string;

    @DtoAttr()
    public resourceFiles?: ResourceFileDto[];

    @DtoAttr()
    public applicationPackageReferences?: ApplicationPackageReferenceDto[];

    @DtoAttr()
    public environmentSettings?: EnvironmentSetting[];

    @DtoAttr()
    public affinityInfo?: any;

    @DtoAttr()
    public runElevated?: boolean;

    @DtoAttr()
    public multiInstanceSettings?: any;

    @DtoAttr()
    public dependsOn?: any;

    @DtoAttr()
    public exitConditions?: any;
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
