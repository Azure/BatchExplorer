export enum ActivityStatus {
    Failed = -1,
    Pending,
    InProgress,
    Cancelled,
    Completed,
}

export class ActivityResponse {
    public progress: number;

    constructor(initialProgress?: number) {
        this.progress = initialProgress || 0;
    }
}
