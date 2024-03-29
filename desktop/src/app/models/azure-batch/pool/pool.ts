import { ListProp, Model, NavigableRecord, Prop, Record } from "@batch-flask/core";
import {
    ApplicationPackageReference, ApplicationPackageReferenceAttributes,
} from "app/models/application-package-reference";
import { CertificateReference } from "app/models/certificate-reference";
import { CloudServiceConfiguration } from "app/models/cloud-service-configuration";
import { Metadata, MetadataAttributes } from "app/models/metadata";
import { MountConfiguration } from "app/models/mount-configuration";
import { NetworkConfiguration } from "app/models/network-configuration";
import { ResizeError } from "app/models/resize-error";
import { StartTask, StartTaskAttributes } from "app/models/start-task";
import { TaskSchedulingPolicy, TaskSchedulingPolicyAttributes } from "app/models/task-scheduling-policy";
import { UserAccount, UserAccountAttributes } from "app/models/user-account";
import {
    VirtualMachineConfiguration,
    VirtualMachineConfigurationAttributes,
} from "app/models/virtual-machine-configuration";
import { ModelUtils, PoolUtils } from "app/utils";
import { List } from "immutable";
import { Duration } from "luxon";
import { AutoScaleRun, AutoScaleRunAttributes } from "./auto-scale-run";
import { PoolStatistics, PoolStatisticsAttributes } from "./pool-statistics";
import { NodeCommunicationMode } from "app/models/node-communication-mode";
import { BatchPoolIdentity } from "app/models/batch-pool-identity";

export enum OSType {
    Windows = "windows",
    Linux = "linux",
}

export interface PoolAttributes {
    allocationState: string;
    allocationStateTransitionTime: Date;
    applicationPackageReferences: ApplicationPackageReferenceAttributes[];
    certificateReferences: any[];
    cloudServiceConfiguration: Partial<CloudServiceConfiguration>;
    creationTime: Date;
    currentDedicatedNodes: number;
    currentLowPriorityNodes: number;
    displayName: string;
    enableAutoScale: boolean;
    autoScaleFormula: string;
    enableInterNodeCommunication: boolean;
    id: string;
    eTag: string;
    lastModified: Date;
    taskSlotsPerNode: number;
    resizeErrors: Array<Partial<ResizeError>>;
    resizeTimeout: Duration;
    state: string;
    stateTransitionTime: Date;
    targetDedicatedNodes: number;
    targetLowPriorityNodes: number;
    taskSchedulingPolicy: TaskSchedulingPolicyAttributes;
    url: string;
    virtualMachineConfiguration: Partial<VirtualMachineConfigurationAttributes>;
    vmSize: string;
    startTask: Partial<StartTaskAttributes>;
    metadata: MetadataAttributes[];
    userAccounts: UserAccountAttributes[];
    applicationLicenses: string[];
    targetNodeCommunicationMode: NodeCommunicationMode;
    autoScaleRun: AutoScaleRunAttributes;
    stats: PoolStatisticsAttributes;
    identity: BatchPoolIdentity;
    currentNodeCommunicationMode: NodeCommunicationMode;
}

/**
 * Class for displaying Batch pool information.
 */
@Model()
export class Pool extends Record<PoolAttributes> implements NavigableRecord {

    @Prop() public allocationState: string;

    @Prop() public allocationStateTransitionTime: Date;

    @ListProp(ApplicationPackageReference)
    public applicationPackageReferences: List<ApplicationPackageReference> = List([]);

    @ListProp(CertificateReference) public certificateReferences: List<CertificateReference> = List([]);

    @Prop() public cloudServiceConfiguration: CloudServiceConfiguration;

    @Prop() public creationTime: Date;

    @Prop() public currentDedicatedNodes: number = 0;

    @Prop() public currentLowPriorityNodes: number = 0;

    @Prop() public displayName: string;

    @Prop() public enableAutoScale: boolean;

    @Prop() public enableInterNodeCommunication: boolean;

    @Prop() public id: string;

    @Prop() public eTag: string;

    @Prop() public lastModified: Date;

    @Prop() public taskSlotsPerNode: number = 1;

    @ListProp(ResizeError) public resizeErrors: List<ResizeError> = List([]);

    @Prop() public resizeTimeout: Duration;

    @Prop() public state: string;

    @Prop() public stateTransitionTime: Date;

    @Prop() public targetDedicatedNodes: number = 0;

    @Prop() public targetLowPriorityNodes: number = 0;

    @Prop() public autoScaleFormula: string;

    @Prop() public autoScaleEvaluationInterval: Duration;

    @Prop() public taskSchedulingPolicy: TaskSchedulingPolicy;

    @Prop() public url: string;

    @Prop() public virtualMachineConfiguration: VirtualMachineConfiguration;

    @Prop() public vmSize: string;

    @Prop() public startTask: StartTask;

    @ListProp(MountConfiguration) public mountConfiguration: List<MountConfiguration>;

    @Prop() public networkConfiguration: NetworkConfiguration;

    @ListProp(Metadata) public metadata: List<Metadata> = List([]);

    @ListProp(UserAccount) public userAccounts: List<UserAccount> = List([]);

    @ListProp(String) public applicationLicenses: List<string> = List([]);

    @Prop() public targetNodeCommunicationMode: NodeCommunicationMode;

    /**
     * Tags are computed from the metadata using an internal key
     */
    @Prop() public tags: List<string> = List([]);

    @Prop() public autoScaleRun: AutoScaleRun;

    @Prop() public stats: PoolStatistics;

    @Prop() public identity: BatchPoolIdentity;

    @Prop() public currentNodeCommunicationMode: NodeCommunicationMode;

    /**
     * Computed field sum of dedicated and low pri nodes
     */
    public targetNodes: number;

    /**
     * Computed field sum of dedicated and low pri nodes
     */
    public currentNodes: number;

    public readonly osName: string;
    public readonly osType: OSType | null;

    constructor(data: Partial<PoolAttributes> = {}) {
        super(data);
        this.tags = ModelUtils.tagsFromMetadata(this.metadata);
        this.osName = PoolUtils.getOsName(this);
        this.osType = PoolUtils.getOsType(this);
        this.targetNodes = this.targetDedicatedNodes + this.targetLowPriorityNodes;
        this.currentNodes = this.currentDedicatedNodes + this.currentLowPriorityNodes;
    }

    public get routerLink(): string[] {
        return ["/pools", this.id];
    }

    public get uid() {
        return this.url;
    }

    public get name() {
        return this.id;
    }
}

export enum PoolState {
    active = "active",
    deleting = "deleting",
}

export enum PoolAllocationState {
    resizing = "resizing",
    stopping = "stopping",
    steady = "steady",
}
