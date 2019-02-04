import { Type } from "@angular/core";
import { PinnedEntityType } from "@batch-flask/core";
import { File, Workspace } from "@batch-flask/ui";
import {
    ArmBatchAccount,
    BatchApplication,
    BatchApplicationPackage,
    BlobContainer,
    Job,
    Node,
    PackageState,
    Pool,
    Subscription,
    SubtaskInformation,
    Task,
} from "app/models";
import { Duration } from "luxon";

export class FixtureFactory<TEntity> {
    constructor(private type: Type<TEntity>, private defaultData: any) {
    }

    /**
     * Create a new fixture entity
     * @param attributes List of attribute you want to override
     */
    public create(attributes: any = {}): TEntity {
        return new this.type(Object.assign({}, this.defaultData, attributes));
    }
}

export const job = new FixtureFactory<Job>(Job, {
    id: "job-id-1",
    displayName: "display name",
    creationTime: new Date(2015, 5, 1, 10, 4, 31),
    lastModified: new Date(2015, 5, 1, 10, 4, 31),
    state: "active",
    stateTransitionTime: new Date(2015, 5, 1, 10, 4, 31),
    previousState: "disabled",
    previousStateTransitionTime: new Date(2015, 5, 1, 10, 4, 31),
    priority: 1,
    constraints: {
        maxWallClockTime: Duration.fromISO("PT2H"),
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
        failureInfo: {
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

export const task = new FixtureFactory<Task>(Task, {
    id: "task-3",
    url: new Date().getTime().toString(),
    creationTime: new Date(2015, 5, 21, 0, 0, 0),
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
        failureInfo: {
            category: "cat1",
            code: "code1",
            message: "this is a message",
            values: ["val1", "val2"],
        },
    },
    constraints: {
        maxWallClockTime: Duration.fromISO("PT2H"),
        maxTaskRetryCount: 3,
        retentionTime: Duration.fromISO("PT6H"),
    },
    nodeInfo: {
        affinityId: "affinityId",
        nodeUrl: "nodeUrl",
        poolId: "poolId",
        nodeId: "nodeId",
    },
});

export const pool = new FixtureFactory<Pool>(Pool, {
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
        osVersion: "WA-GUEST-OS-2.28_201409-01",
    },
    resizeTimeout: Duration.fromISO("PT15M"),
    currentDedicated: 5,
    targetDedicated: 5,
    enableAutoScale: false,
    enableInterNodeCommunication: false,
    maxTasksPerNode: 3,
    taskSchedulingPolicy: {
        nodeFillType: "Spread",
    },
});

// todo: make model for this
export const jobPreparationAndReleaseTask = new FixtureFactory<any>(Object, {
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

export const subTask = new FixtureFactory<SubtaskInformation>(SubtaskInformation, {
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

export const node = new FixtureFactory<Node>(Node, {
    id: "node-1",
    displayName: "MyImaginaryNode",
    state: "running",
    isDedicated: true,
});

export const subscription = new FixtureFactory<Subscription>(Subscription, {
    id: "/subscriptions/sub-id-xyz",
    subscriptionId: "sub-id-xyz",
    tenantId: "tenant-id",
    displayName: "Test subscription",
    state: "ready",
});

export const account = new FixtureFactory<ArmBatchAccount>(ArmBatchAccount, {
    id: "account-1",
    name: "account-test",
    location: "westus",
    type: "BatchAccount",
    properties: {
        accountEndpoint: "account-1.region.batch.azure.com",
        autoStorage: {
            storageAccountId: null,
            lastKeySync: null,
        },
    },
});

export const application = new FixtureFactory<BatchApplication>(BatchApplication, {
    id: "app-1",
});

export const applicationPackage = new FixtureFactory<BatchApplicationPackage>(BatchApplicationPackage, {
    version: "1",
    state: PackageState.active,
    format: "zip",
    lastActivationTime: new Date(),
    storageUrl: "",
    storageUrlExpiry: null,
});

export const file = new FixtureFactory<File>(File, {
    name: "file-1",
    url: "url/to/file",
    isDirectory: false,
    properties: {
        contentLength: 0,
        contentType: "text/plain",
        creationTime: new Date(),
        lastModified: new Date(),
    },
});

export const pinnable = new FixtureFactory<any>(Object, {
    id: "pin-1",
    routerLink: [],
    pinnableType: PinnedEntityType.Application,
    url: "",
});

export const container = new FixtureFactory<BlobContainer>(BlobContainer, {
    id: "fgrp-container",
    name: "container",
});

export const workspace = new FixtureFactory<Workspace>(Workspace, {
    id: "bob",
    displayName: "my workpace bob",
    description: "who cares",
    features: {} as any,
});
