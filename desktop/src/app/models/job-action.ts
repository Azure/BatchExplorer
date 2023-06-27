// https://msdn.microsoft.com/en-us/library/azure/dn820105.aspx#exitOptions
export enum JobAction {
    none = "none",
    disable = "disable",
    terminate = "terminate",
}

/**
 * Contains information about the action the Batch service should take when all tasks
 * in the job are in the completed state
 * https://msdn.microsoft.com/en-us/library/azure/mt282178.aspx
 */
export enum AllTasksCompleteAction {
    noaction = "noaction",
    terminatejob = "terminatejob",
}

/**
 * Contains information about the action the Batch service should take when any task in the job fails
 * https://msdn.microsoft.com/en-us/library/azure/mt282178.aspx
 */
export enum TaskFailureAction {
    noaction = "noaction",
    performexitoptionsjobaction = "performexitoptionsjobaction",
}
