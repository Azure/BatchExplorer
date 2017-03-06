/**
 * Information about the compute node on which a task ran.
 */
export class ComputeNodeInformation {
    public affinityId: string;
    public nodeUrl: string;
    public poolId: string;
    public nodeId: string;
    public taskRootDirectory: string;
    public taskRootDirectoryUrl: string;
}
