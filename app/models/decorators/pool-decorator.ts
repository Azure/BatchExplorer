import { Pool, UserAccount, UserAccountElevationLevel } from "app/models";
import { DecoratorBase } from "app/utils/decorators";
import * as moment from "moment";
import { CloudServiceConfigurationDecorator } from "./cloud-service-configuration-decorator";
import { TaskSchedulingPolicyDecorator } from "./task-scheduling-policy-decorator";
import { VirtualMachineConfigurationDecorator } from "./virtual-machine-configuration-decorator";

export class PoolDecorator extends DecoratorBase<Pool> {
    public allocationState: string;
    public allocationStateTransitionTime: string;
    public applicationPackageReferences: any[];
    public certificateReferences: any[];
    public cloudServiceConfiguration: CloudServiceConfigurationDecorator;
    public creationTime: string;
    public currentDedicatedNodes: string;
    public currentLowPriorityNodes: string;
    public displayName: string;
    public enableAutoScale: string;
    public enableInterNodeCommunication: string;
    public id: string;
    public lastModified: string;
    public maxTasksPerNode: string;
    public resizeError: any;
    public resizeTimeout: string;
    public state: string;
    public stateTransitionTime: string;
    public targetDedicatedNodes: string;
    public targetLowPriorityNodes: string;
    public autoScaleFormula: string;
    public autoScaleEvaluationInterval: string;
    public taskSchedulingPolicy: TaskSchedulingPolicyDecorator;
    public url: string;
    public virtualMachineConfiguration: VirtualMachineConfigurationDecorator;
    public vmSize: string;
    public poolOs: string;
    public poolOsIcon: string;
    public lastResized: string;
    public userAccounts: string;

    constructor(private pool?: Pool) {
        super(pool);
        this.allocationState = this.stateField(pool.allocationState);
        this.allocationStateTransitionTime = this.dateField(pool.allocationStateTransitionTime);
        this.cloudServiceConfiguration =
            new CloudServiceConfigurationDecorator(pool.cloudServiceConfiguration || {} as any);
        this.creationTime = this.dateField(pool.creationTime);
        this.currentDedicatedNodes = this.stringField(pool.currentDedicatedNodes);
        this.currentLowPriorityNodes = this.stringField(pool.currentLowPriorityNodes);
        this.displayName = this.stringField(pool.displayName);
        this.enableAutoScale = this.booleanField(pool.enableAutoScale);
        this.enableInterNodeCommunication = this.booleanField(pool.enableInterNodeCommunication);
        this.id = this.stringField(pool.id);
        this.lastModified = this.dateField(pool.lastModified);
        this.maxTasksPerNode = this.stringField(pool.maxTasksPerNode);
        // this.resizeError = <any>;
        this.resizeTimeout = this.timespanField(pool.resizeTimeout);
        this.state = this.stateField(pool.state);
        this.stateTransitionTime = this.dateField(pool.stateTransitionTime);
        this.targetDedicatedNodes = this.stringField(pool.targetDedicatedNodes);
        this.targetLowPriorityNodes = this.stringField(pool.targetLowPriorityNodes);
        this.autoScaleFormula = this.stringField(pool.autoScaleFormula);
        this.autoScaleEvaluationInterval = this.timespanField(pool.autoScaleEvaluationInterval);
        this.taskSchedulingPolicy =
            new TaskSchedulingPolicyDecorator(pool.taskSchedulingPolicy);
        this.url = this.stringField(pool.url);
        this.virtualMachineConfiguration =
            new VirtualMachineConfigurationDecorator(pool.virtualMachineConfiguration || {} as any);
        this.vmSize = this.stringField(pool.vmSize);

        this.poolOs = this._computePoolOs();
        this.poolOsIcon = this._computePoolOsIcon(this.poolOs);

        this.lastResized = moment(this.pool.allocationStateTransitionTime).fromNow();

        this.userAccounts = pool.userAccounts.map(x => this._decorateUserAccount(x)).join(", ");
    }

    private _computePoolOs(): string {
        return this.pool.osName();
    }

    private _computePoolOsIcon(os): string {
        return this.pool.osIconName();
    }

    private _decorateUserAccount(user: UserAccount) {
        if (user.elevationLevel === UserAccountElevationLevel.admin) {
            return `${user.name} (admin)`;
        }
        return user.name;
    }
}
