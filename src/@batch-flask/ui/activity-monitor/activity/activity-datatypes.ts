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

export class ActivityResponse {
    public progress: number;

    constructor(initialProgress?: number) {
        this.progress = initialProgress || 0;
    }
}
