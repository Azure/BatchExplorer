// tslint:disable:variable-name

export type JobAction = "noaction" | "terminatejob";
export const JobAction = {
    noaction: "noaction" as JobAction,
    terminatejob: "terminatejob" as JobAction,
};

export type TaskFailureAction = "noaction" | "performexitoptionsjobaction";
export const TaskFailureAction = {
    noaction: "noaction" as TaskFailureAction,
    performexitoptionsjobaction: "performexitoptionsjobaction" as TaskFailureAction,
};
