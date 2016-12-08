
import { Job, Node, Pool, SubtaskInformation, Task } from "app/models";

export class Fixture<T> {
    private _data: T;

    constructor(data: any) {
        this._data = data;
    }

    /**
     * Create a new fixture entity
     * @param attributes List of attribute you want to override
     */
    public create(attributes: any = {}): FixtureEntity<T> {
        const newData = this._fromJS(Object.assign(this._data, attributes));
        return new FixtureEntity(newData);
    }

    private _fromJS(data: any): T {
        return data;
    }
}

export class FixtureEntity<T> {
    public data: T;

    constructor(data: T) {
        this.data = data;
    }

    public toJS(): any {
        return (<any>this.data).toJS();
    }

    public toJSON(): any {
        return this.data;
    }
}

export const job = new Fixture<Job>({
    id: "job-id-1",
    displayName: "displayName",
    creationTime: new Date(2015, 5, 1, 10, 4, 31),
    lastModified: new Date(2015, 5, 1, 10, 4, 31),
    state: "active",
    stateTransitionTime: new Date(2015, 5, 1, 10, 4, 31),
    previousState: "disabled",
    previousStateTransitionTime: new Date(2015, 5, 1, 10, 4, 31),
    priority: 1,
    constraints: {
        maxWallClockTime: "PT2H",
        maxTaskRetryCount: 3,
    },
    jobManagerTask: {
        id: "task-0",
        displayName: "manager task",
    },
    commonEnvironmentSettings: [
        { name: "env1", value: "val1" },
        { name: "env2", value: "val2" },
        { name: "env3", value: "val3" },
        { name: "env4", value: "val4" },
    ],
    poolInfo: {
        poolId: "pool-1",
        autoPoolSpecification: {
            autoPoolIdPrefix: "prefix",
            poolLifetimeOption: "job",
            keepAlive: true,
            pool: {
                id: "pool-1",
                displayName: "pool display name",
            },
        },
    },
    executionInfo: {
        startTime: new Date(2015, 5, 1, 10, 4, 31),
        endTime: new Date(2015, 5, 1, 10, 4, 31),
        poolId: "pool-1",
        terminateReason: "because i said so",
        schedulingError: {
            category: "cat1",
            code: "code1",
            message: "this is a message",
            values: ["val1", "val2"],
        },
    },
    metadata: [
        { name: "meta1", value: "metaVal1" },
        { name: "meta2", value: "metaVal2" },
        { name: "meta3", value: "metaVal3" },
    ],
    jobPreparationTask: {
        id: "prep-task-id",
    },
    usesTaskDependencies: false,
});

export const task = new Fixture<Task>({
    id: "task-3",
    url: new Date().getTime().toString(),
    creationTime: new Date(2015, 5, 21, 0, 0 , 0),
    lastModified: new Date(2015, 5, 21, 0, 0, 0),
    displayName: "displayName",
    nonRetryableExitCodes: [1, 2],
    previousState: "active",
    previousStateTransitionTime: new Date(2015, 5, 21, 0, 0, 0),
    runElevated: true,
    state: "running",
    stateTransitionTime: new Date(2015, 5, 22, 0, 0, 0),
    successExitCodes: [-1, 0],
    executionInfo: {
        startTime: new Date(2015, 5, 21, 0, 0, 0),
        endTime: new Date(2015, 5, 22, 0, 0, 0),
        exitCode: 2,
        retryCount: 1,
        lastRetryTime: new Date(2015, 5, 21, 0, 0, 0),
        requeueCount: 1,
        lastRequeueTime: new Date(2015, 5, 21, 0, 0, 0),
        schedulingError: {
            category: "cat1",
            code: "code1",
            message: "this is a message",
            values: ["val1", "val2"],
        },
    },
    constraints: {
        maxWallClockTime: "PT2H",
        maxTaskRetryCount: 3,
        retentionTime: "PT6H",
    },
    nodeInfo: {
        affinityId: "affinityId",
        nodeUrl: "nodeUrl",
        poolId: "poolId",
        nodeId: "nodeId",
    },
});

export const pool = new Fixture<Pool>({
    id: "mypool1",
    url: "https://myaccount.myregion.batch.azure.com/pools/mypool1",
    eTag: "#################",
    lastModified: new Date(2015, 5, 1, 10, 4, 31),
    creationTime: new Date(2013, 2, 5, 12, 2, 5),
    state: "active",
    stateTransitionTime: new Date(2015, 5, 1, 10, 20, 31),
    allocationState: "steady",
    allocationStateTransitionTime: new Date(2015, 5, 1, 10, 20, 31),
    vmSize: "standard_a1",
    cloudServiceConfiguration: {
        osFamily: "4",
        targetOSVersion: "WA-GUEST-OS-2.28_201409-01",
        currentOSVersion: "WA-GUEST-OS-2.28_201409-01",
    },
    resizeTimeout: "PT15M",
    currentDedicated: 5,
    targetDedicated: 5,
    enableAutoScale: false,
    enableInterNodeCommunication: false,
    maxTasksPerNode: 3,
    taskSchedulingPolicy: {
        nodeFillType: "Spread",
    },
});

// todo: make model for me
export const jobPreparationAndReleaseTask = new Fixture<any>({
    poolId: "pool-1",
    nodeId: "node-1",
    nodeUrl: "https://fake-api/pools/mypool1/nodes/node-1",
    jobPreparationTaskExecutionInfo: {
        state: "completed",
        startTime: new Date(2015, 5, 1, 10, 20, 31),
        endTime: new Date(2015, 5, 1, 20, 12, 42),
        taskRootDirectory: "tasks/myjob/job-1/myjobpreptask",
        taskRootDirectoryUrl: "https://myaccount.myregion.batch.azure.com/pools/mypool1/nodes/"
            + "tvm-2167304207_1-20140905t174658z/files/tasks/myjob/job-1/myjobpreptask",
        exitCode: 0,
        retryCount: 0,
    },
    jobReleaseTaskExecutionInfo: {
        state: "completed",
        startTime: new Date(2015, 5, 2, 11, 20, 32),
        endTime: new Date(2015, 5, 2, 18, 12, 38),
        taskRootDirectory: "tasks/myjob/job-1/myjobreleasetask",
        taskRootDirectoryUrl: "https://myaccount.myregion.batch.azure.com/pools/mypool1/nodes/"
            + "tvm-2167304207_1-20140905t174658z/files/tasks/myjob/job-1/myjobreleasetask",
        exitCode: 0,
        retryCount: 0,
    },
});

export const subTask = new Fixture<SubtaskInformation>({
    id: "1",
    startTime: new Date(2015, 5, 2, 11, 20, 32),
    endTime: new Date(2015, 5, 2, 18, 12, 43),
    state: "completed",
    stateTransitionTime: new Date(2015, 5, 1, 10, 20, 31),
    previousState: "running",
    previousStateTransitionTime: new Date(2015, 5, 1, 10, 18, 10),
    exitCode: 0,
    nodeInfo: {
        affinityId: "TVM:tvm-2167304207_3-20140918t045746z",
        nodeUrl: "https://myaccount.batch.core.windows.net/pools/"
            + "mypool_3FA95161-1349-44F6-86FC-52FC13BDAAE4/tvms/tvm-2167304207_3-20140918t045746z",
        poolId: "pool-1",
        nodeId: "node-1",
        taskRootDirectory: "tasks/myjob/job-1/mytask1/1/wd",
        taskRootDirectoryUrl: " https://myaccount.myregion.batch.azure.com/pools/pool-1/nodes/node-1/"
            + "files/tasks/myjob/job-1/mytask1/1/wd",
    },
});

export const node = new Fixture<Node>({
    id: "node-1",
    displayName: "MyImaginaryNode",
    state: "running",
});
