// https://msdn.microsoft.com/en-us/library/azure/dn820105.aspx#exitOptions
export type JobAction = "none" | "disable" | "terminate";
export const JobAction = {
    none: "none" as JobAction,
    disable: "disable" as JobAction,
    terminate: "terminate" as JobAction,
};

// https://msdn.microsoft.com/en-us/library/azure/mt282178.aspx
export type AllTasksCompleteAction = "noaction" | "terminatejob";
export const AllTasksCompleteAction = {
    noaction: "noaction" as AllTasksCompleteAction,
    terminatejob: "terminatejob" as AllTasksCompleteAction,
};

export type TaskFailureAction = "noaction" | "performexitoptionsjobaction";
export const TaskFailureAction = {
    noaction: "noaction" as TaskFailureAction,
    performexitoptionsjobaction: "performexitoptionsjobaction" as TaskFailureAction,
};
