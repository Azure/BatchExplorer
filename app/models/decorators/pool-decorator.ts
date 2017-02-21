import { Pool } from "app/models";
import { CloudServiceConfigurationDecorator } from "app/models/decorators/cloud-service-configuration-decorator";
import { TaskSchedulingPolicyDecorator } from "app/models/decorators/task-scheduling-policy-decorator";
import { VirtualMachineConfigurationDecorator } from "app/models/decorators/virtual-machine-configuration-decorator";
import { DecoratorBase } from "app/utils/decorators";

export class PoolDecorator extends DecoratorBase<Pool> {
    public allocationState: string;
    public allocationStateTransitionTime: string;
    public applicationPackageReferences: any[];
    public certificateReferences: any[];
    public cloudServiceConfiguration: CloudServiceConfigurationDecorator;
    public creationTime: string;
    public currentDedicated: string;
    public displayName: string;
    public enableAutoscale: string;
    public enableInterNodeCommunication: string;
    public id: string;
    public lastModified: string;
    public maxTasksPerNode: string;
    public resizeError: any;
    public resizeTimeout: string;
    public state: string;
    public stateTransitionTime: string;
    public targetDedicated: string;
    public taskSchedulingPolicy: TaskSchedulingPolicyDecorator;
    public url: string;
    public virtualMachineConfiguration: VirtualMachineConfigurationDecorator;
    public vmSize: string;

    constructor(private pool?: Pool) {
        super(pool);

        this.allocationState = this.stateField(pool.allocationState);
        this.allocationStateTransitionTime = this.dateField(pool.allocationStateTransitionTime);
        this.cloudServiceConfiguration =
            new CloudServiceConfigurationDecorator(pool.cloudServiceConfiguration || <any>{});
        this.creationTime = this.dateField(pool.creationTime);
        this.currentDedicated = this.stringField(pool.currentDedicated);
        this.displayName = this.stringField(pool.displayName);
        this.enableAutoscale = this.booleanField(pool.enableAutoscale);
        this.enableInterNodeCommunication = this.booleanField(pool.enableInterNodeCommunication);
        this.id = this.stringField(pool.id);
        this.lastModified = this.dateField(pool.lastModified);
        this.maxTasksPerNode = this.stringField(pool.maxTasksPerNode);
        // this.resizeError = <any>;
        this.resizeTimeout = this.timespanField(pool.resizeTimeout);
        this.state = this.stateField(pool.state);
        this.stateTransitionTime = this.dateField(pool.stateTransitionTime);
        this.targetDedicated = this.stringField(pool.targetDedicated);
        this.taskSchedulingPolicy =
            new TaskSchedulingPolicyDecorator(pool.taskSchedulingPolicy);
        this.url = this.stringField(pool.url);
        this.virtualMachineConfiguration =
            new VirtualMachineConfigurationDecorator(pool.virtualMachineConfiguration || <any>{});
        this.vmSize = this.stringField(pool.vmSize);
    }

    public get poolOs(): string {
        if (this.pool.cloudServiceConfiguration) {
            let osName: string;
            let osFamily = this.pool.cloudServiceConfiguration.osFamily;

            if (osFamily === 2) {
                osName = "Windows Server 2008 R2 SP1";
            } else if (osFamily === 3) {
                osName = "Windows Server 2012";
            } else {
                osName = "Windows Server 2012 R2";
            }

            return osName;
        }

        if (this.pool.virtualMachineConfiguration.imageReference.publisher ===
            "MicrosoftWindowsServer") {
            let osName = "Windows Server";
            osName += this.pool.virtualMachineConfiguration.imageReference.sku;

            return osName;
        }

        return "Linux";
    }

    public get poolOsIcon(): string {
        if (this.poolOs.includes("Windows")) {
            return "windows";
        }

        return "linux";
    }
}
