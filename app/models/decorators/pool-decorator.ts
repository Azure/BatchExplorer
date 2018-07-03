import { List } from "immutable";
import * as moment from "moment";

import {
    ApplicationPackageReference, CertificateReference, Pool, UserAccount, UserAccountElevationLevel,
} from "app/models";
import { PoolEndpointConfigurationDecorator, StartTaskDecorator } from "app/models/decorators";
import { PoolUtils } from "app/utils";
import { DecoratorBase } from "app/utils/decorators";
import { CloudServiceConfigurationDecorator } from "./cloud-service-configuration-decorator";
import { TaskSchedulingPolicyDecorator } from "./task-scheduling-policy-decorator";
import { VirtualMachineConfigurationDecorator } from "./virtual-machine-configuration-decorator";

export class PoolDecorator extends DecoratorBase<Pool> {
    public allocationState: string;
    public allocationStateTransitionTime: string;
    public applicationPackageReferences: List<ApplicationPackageReference>;
    public certificateReferences: List<CertificateReference>;
    public cloudServiceConfiguration: CloudServiceConfigurationDecorator;
    public creationTime: string;
    public currentDedicatedNodes: string;
    public currentLowPriorityNodes: string;
    public displayName: string;
    public enableAutoScale: string;
    public enableInterNodeCommunication: string;
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
    public poolEndpointConfiguration: PoolEndpointConfigurationDecorator;
    public poolOs: string;
    public poolOsIcon: string;
    public lastResized: string;
    public userAccounts: string;
    public dedicatedNodes: string;
    public lowPriorityNodes: string;
    public networkSubnetId: string;
    public startTask: StartTaskDecorator;
    public applicationLicenses: string;

    public get routerLink() {
        return this.pool.routerLink;
    }

    constructor(public pool: Pool) {
        super(pool);
        this.displayName = this.stringField(pool.displayName);
        this.allocationState = this.stateField(pool.allocationState);
        this.allocationStateTransitionTime = this.dateField(pool.allocationStateTransitionTime);
        this.creationTime = this.dateField(pool.creationTime);
        this.currentDedicatedNodes = this.stringField(pool.currentDedicatedNodes);
        this.currentLowPriorityNodes = this.stringField(pool.currentLowPriorityNodes);
        this.enableAutoScale = this.booleanField(pool.enableAutoScale);
        this.enableInterNodeCommunication = this.booleanField(pool.enableInterNodeCommunication);
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
        this.url = this.stringField(pool.url);
        this.vmSize = this.stringField(pool.vmSize);
        this.lastResized = moment(this.pool.allocationStateTransitionTime).fromNow();
        this.userAccounts = pool.userAccounts.map(x => this._decorateUserAccount(x)).join(", ");
        this.dedicatedNodes = PoolUtils.poolNodesStatus(pool, pool.currentDedicatedNodes, pool.targetDedicatedNodes);
        this.startTask = pool.startTask && new StartTaskDecorator(pool.startTask);
        this.lowPriorityNodes = PoolUtils.poolNodesStatus(pool,
            pool.currentLowPriorityNodes, pool.targetLowPriorityNodes);

        this.poolOs = this._computePoolOs();
        this.poolOsIcon = this._computePoolOsIcon(this.poolOs);

        this.cloudServiceConfiguration =
            new CloudServiceConfigurationDecorator(pool.cloudServiceConfiguration || {} as any, this.poolOs);

        this.virtualMachineConfiguration =
            new VirtualMachineConfigurationDecorator(pool.virtualMachineConfiguration || {} as any, this.poolOs);

        this.taskSchedulingPolicy =
            new TaskSchedulingPolicyDecorator(pool.taskSchedulingPolicy || {});

        this.applicationPackageReferences = List(pool.applicationPackageReferences);
        this.certificateReferences = List(pool.certificateReferences);
        this.networkSubnetId = pool.networkConfiguration && pool.networkConfiguration.subnetId;
        this.applicationLicenses = pool.applicationLicenses.join(", ");
        this.poolEndpointConfiguration = new PoolEndpointConfigurationDecorator(
            (pool.networkConfiguration && pool.networkConfiguration.endpointConfiguration) || {});
    }

    private _computePoolOs(): string {
        return this.pool.osName;
    }

    private _computePoolOsIcon(os): string {
        return PoolUtils.getComputePoolOsIcon(this.pool.osType);
    }

    private _decorateUserAccount(user: UserAccount) {
        if (user.elevationLevel === UserAccountElevationLevel.admin) {
            return `${user.name} (admin)`;
        }
        return user.name;
    }
}
