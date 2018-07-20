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
