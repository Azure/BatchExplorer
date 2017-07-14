// https://msdn.microsoft.com/en-us/library/azure/dn820105.aspx#exitOptions
export enum JobAction {
    none = "none",
    disable = "disable",
    terminate = "terminate",
}

// https://msdn.microsoft.com/en-us/library/azure/mt282178.aspx
export enum AllTasksCompleteAction {
    noaction = "noaction",
    terminatejob = "terminatejob",
}

export enum TaskFailureAction {
    noaction = "noaction",
    performexitoptionsjobaction = "performexitoptionsjobaction",
}
