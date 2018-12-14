import { Dto, DtoAttr, ListDtoAttr } from "@batch-flask/core";
import { NodeFillType } from "app/models/task-scheduling-policy";

import { Duration } from "luxon";
import { AppPackageReferenceDto } from "../application-package-reference.dto";
import { CertificateReferenceDto } from "../certificate-reference.dto";
import { CloudServiceConfiguration } from "../cloud-service-configuration.dto";
import { MetaDataDto } from "../metadata.dto";
import { NetworkConfigurationDto } from "../network-configuration.dto";
import { StartTaskDto } from "../start-task.dto";
import { UserAccountDto } from "../user-account.dto";
import { VirtualMachineConfigurationDto } from "../virtual-machine-configuration.dto";

export class PoolCreateDto extends Dto<PoolCreateDto> {
    @DtoAttr() public id: string;

    @DtoAttr() public displayName?: string;

    @DtoAttr() public vmSize?: string;

    @DtoAttr() public cloudServiceConfiguration?: CloudServiceConfiguration;

    @DtoAttr() public virtualMachineConfiguration?: VirtualMachineConfigurationDto;

    @DtoAttr() public networkConfiguration?: NetworkConfigurationDto;

    @DtoAttr() public resizeTimeout?: Duration;

    @DtoAttr() public targetDedicatedNodes?: number;

    @DtoAttr() public targetLowPriorityNodes?: number;

    @DtoAttr() public maxTasksPerNode?: number;

    @DtoAttr() public taskSchedulingPolicy?: {
        nodeFillType?: NodeFillType;
    };

    @DtoAttr() public autoScaleFormula?: string;

    @DtoAttr() public autoScaleEvaluationInterval?: Duration;

    @DtoAttr() public enableAutoScale?: boolean;

    @DtoAttr() public enableInterNodeCommunication?: boolean;

    @DtoAttr() public startTask?: StartTaskDto;

    @ListDtoAttr(CertificateReferenceDto) public certificateReferences?: CertificateReferenceDto[];

    @ListDtoAttr(AppPackageReferenceDto) public applicationPackageReferences: AppPackageReferenceDto[];

    @ListDtoAttr(MetaDataDto) public metadata: MetaDataDto[];

    @ListDtoAttr(UserAccountDto) public userAccounts: UserAccountDto[];

    @DtoAttr() public applicationLicenses: string[];
}
