import { Model } from "@bl-common/core";
import { JobStats } from "./job-stats";

/**
 * Statistics about an executed job schedule
 */
@Model()
export class JobScheduleStats extends JobStats {
    constructor(data: any) {
        super(data);
    }
}
