import { Dto, DtoAttr } from "app/core";
import { NodeFillType } from "app/models";
import * as moment from "moment";

import { CloudServiceConfiguration } from "./cloud-service-configuration.dto";
import { MetaDataDto } from "./metadata.dto";
import { UserAccountDto } from "./user-account.dto";
import { VirtualMachineConfiguration } from "./virtual-machine-configuration.dto";

export class PoolCreateDto extends Dto<PoolCreateDto> {
    @DtoAttr()
    public id: string;

    @DtoAttr()
    public displayName?: string;

    @DtoAttr()
    public vmSize?: string;

    @DtoAttr()
    public cloudServiceConfiguration?: CloudServiceConfiguration;

    @DtoAttr()
    public virtualMachineConfiguration?: VirtualMachineConfiguration;

    @DtoAttr()
    public networkConfiguration?: {
        subnetId: string;
    };

    @DtoAttr()
    public resizeTimeout?: moment.Duration;

    @DtoAttr()
    public targetDedicatedNodes?: number;

    @DtoAttr()
    public targetLowPriorityNodes?: number;

    @DtoAttr()
    public maxTasksPerNode?: number;

    @DtoAttr()
    public taskSchedulingPolicy?: {
        nodeFillType?: NodeFillType;
    };

    @DtoAttr()
    public autoScaleFormula?: string;

    @DtoAttr()
    public autoScaleEvaluationInterval?: moment.Duration;

    @DtoAttr()
    public enableAutoScale?: boolean;

    @DtoAttr()
    public enableInterNodeCommunication?: boolean;

    @DtoAttr()
    public startTask?: any;

    @DtoAttr()
    public certificateReferences?: any[];

    @DtoAttr()
    public applicationPackageReferences: any[];

    @DtoAttr()
    public metadata: MetaDataDto[];

    @DtoAttr()
    public userAccounts: UserAccountDto[];

    @DtoAttr()
    public applicationLicenses: string[];
}
