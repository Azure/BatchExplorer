import { Activity } from "@batch-flask/ui/activity-monitor";

export enum ActivityStatus {
    Failed = -1,
    Pending,
    InProgress,
    Canceled,
    Completed,
}

export enum ActivityAction {
    Start,
    Cancel,
    Finish,
}

export interface ActivitySnapshot {
    activity: Activity;
    status: ActivityStatus;
}
