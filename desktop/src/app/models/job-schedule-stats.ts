import { Model } from "@batch-flask/core";
import { JobStatistics } from "./job-stats";

/**
 * Statistics about an executed job schedule
 */
@Model()
export class JobScheduleStats extends JobStatistics {
}
