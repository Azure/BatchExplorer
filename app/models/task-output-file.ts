import { Model, Prop, Record } from "@batch-flask/core";

export interface TaskOutputFileAttributes {
    filePattern: string;
    destination: TaskOutputFileDestinationAttributes;
    uploadOptions: TaskOutputFileUploadOptionsAttributes;
}

export interface TaskOutputFileDestinationAttributes {
    container: TaskOutputFileContainerAttributes;
}

export interface TaskOutputFileUploadOptionsAttributes {
    uploadCondition: TaskOutputFileUploadCondition;
}

export interface TaskOutputFileContainerAttributes {
    path?: string;
    containerUrl: string;
}

export enum TaskOutputFileUploadCondition {
    taskSuccess = "taskSuccess",
    taskFailure = "taskFailure",
    taskCompletion = "taskCompletion",
}

@Model()
export class TaskOutputFileContainer extends Record<TaskOutputFileContainerAttributes> {
    @Prop() public path: string;
    @Prop() public containerUrl: string;
}

@Model()
export class TaskOutputFileDestination extends Record<TaskOutputFileDestinationAttributes> {
    @Prop() public container: string;
}

@Model()
export class TaskOutputFileUploadOptions extends Record<TaskOutputFileUploadOptionsAttributes> {
    @Prop() public uploadCondition: TaskOutputFileUploadCondition = TaskOutputFileUploadCondition.taskCompletion;
}

@Model()
export class TaskOutputFile extends Record<TaskOutputFileAttributes> {
    @Prop() public filePattern: string;
    @Prop() public destination: TaskOutputFileDestination;
    @Prop() public uploadOptions: string;
}
