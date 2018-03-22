import { List } from "immutable";
import { Duration } from "moment";

import { ListProp, Model, NavigableRecord, Prop, Record } from "@batch-flask/core";
import { ModelUtils, PoolUtils } from "app/utils";
import { CloudServiceConfiguration } from "./cloud-service-configuration";
import { Metadata, MetadataAttributes } from "./metadata";
import { NetworkConfiguration } from "./network-configuration";
import { ResizeError } from "./resize-error";
import { StartTask, StartTaskAttributes } from "./start-task";
import { TaskSchedulingPolicy } from "./task-scheduling-policy";
import { UserAccount, UserAccountAttributes } from "./user-account";
import { VirtualMachineConfiguration, VirtualMachineConfigurationAttributes } from "./virtual-machine-configuration";

export interface PoolAttributes {
    allocationState: string;
    allocationStateTransitionTime: Date;
    applicationPackageReferences: any[];
    certificateReferences: any[];
    cloudServiceConfiguration: Partial<CloudServiceConfiguration>;
    creationTime: Date;
    currentDedicatedNodes: number;
    currentLowPriorityNodes: number;
    displayName: string;
    enableAutoscale: boolean;
    enableInterNodeCommunication: boolean;
    id: string;
    lastModified: Date;
    maxTasksPerNode: number;
    resizeErrors: Array<Partial<ResizeError>>;
    resizeTimeout: Duration;
    state: string;
    stateTransitionTime: Date;
    targetDedicatedNodes: number;
    targetLowPriorityNodes: number;
    taskSchedulingPolicy: TaskSchedulingPolicy;
    url: string;
    virtualMachineConfiguration: Partial<VirtualMachineConfigurationAttributes>;
    vmSize: string;
    startTask: Partial<StartTaskAttributes>;
    metadata: MetadataAttributes[];
    userAccounts: UserAccountAttributes[];
    applicationLicenses: string[];
}

/**
 * Class for displaying Batch pool information.
 */
@Model()
export class Pool extends Record<PoolAttributes> implements NavigableRecord  {

    @Prop() public allocationState: string;

    @Prop() public allocationStateTransitionTime: Date;

    @ListProp(Object) public applicationPackageReferences: List<any>;

    @ListProp(Object) public certificateReferences: List<any>;

    @Prop() public cloudServiceConfiguration: CloudServiceConfiguration;

    @Prop() public creationTime: Date;

    @Prop() public currentDedicatedNodes: number = 0;

    @Prop() public currentLowPriorityNodes: number = 0;

    @Prop() public displayName: string;

    @Prop() public enableAutoScale: boolean;

    @Prop() public enableInterNodeCommunication: boolean;

    @Prop() public id: string;

    @Prop() public lastModified: Date;

    @Prop() public maxTasksPerNode: number = 1;

    @ListProp(ResizeError) public resizeErrors: List<ResizeError> = List([]);

    @Prop() public resizeTimeout: Duration;

    @Prop() public state: string;

    @Prop() public stateTransitionTime: Date;

    @Prop() public targetDedicatedNodes: number = 0;

    @Prop() public targetLowPriorityNodes: number = 0;

    @Prop() public autoScaleFormula: string;

    @Prop() public autoScaleEvaluationInterval: Duration;

    @Prop() public taskSchedulingPolicy: any;

    @Prop() public url: string;

    @Prop() public virtualMachineConfiguration: VirtualMachineConfiguration;

    @Prop() public vmSize: string;

    @Prop() public startTask: StartTask;

    @Prop() public networkConfiguration: NetworkConfiguration;

    @ListProp(Metadata) public metadata: List<Metadata> = List([]);

    @ListProp(UserAccount) public userAccounts: List<UserAccount> = List([]);

    @ListProp(String) public applicationLicenses: List<string> = List([]);

    /**
     * Tags are computed from the metadata using an internal key
     */
    @Prop() public tags: List<string> = List([]);

    /**
     * Computed field sum of dedicated and low pri nodes
     */
    public targetNodes: number;

    /**
     * Computed field sum of dedicated and low pri nodes
     */
    public currentNodes: number;

    private _osName: string;
    private _osIcon: string;

    constructor(data: Partial<PoolAttributes> = {}) {
        super(data);
        this.tags = ModelUtils.tagsFromMetadata(this.metadata);
        this._osName = PoolUtils.getOsName(this);
        this._osIcon = PoolUtils.getComputePoolOsIcon(this._osName);
        this.targetNodes = this.targetDedicatedNodes + this.targetLowPriorityNodes;
        this.currentNodes = this.currentDedicatedNodes + this.currentLowPriorityNodes;
    }

    public osIconName(): string {
        return this._osIcon;
    }

    public osName(): string {
        return this._osName;
    }

    public get routerLink(): string[] {
        return ["/pools", this.id];
    }
}

export enum PoolState {
    active = "active",
    upgrading = "upgrading",
    deleting = "deleting",
}

export enum PoolAllocationState {
    resizing = "resizing",
    stopping = "stopping",
    steady = "steady",
}
