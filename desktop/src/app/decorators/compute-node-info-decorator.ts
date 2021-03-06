import { ComputeNodeInformation } from "app/models";
import { DecoratorBase } from "app/utils/decorators";

export class ComputeNodeInfoDecorator extends DecoratorBase<ComputeNodeInformation> {
    public affinityId: string;
    public nodeUrl: string;
    public poolId: string;
    public nodeId: string;
    public taskRootDirectory: string;
    public taskRootDirectoryUrl: string;

    constructor(nodeInfo: ComputeNodeInformation) {
        super(nodeInfo);

        this.affinityId = this.stringField(nodeInfo.affinityId);
        this.nodeUrl = this.stringField(nodeInfo.nodeUrl);
        this.poolId = this.stringField(nodeInfo.poolId);
        this.nodeId = this.stringField(nodeInfo.nodeId);
        this.taskRootDirectory = this.stringField(nodeInfo.taskRootDirectory);
        this.taskRootDirectoryUrl = this.stringField(nodeInfo.taskRootDirectoryUrl);
    }
}
