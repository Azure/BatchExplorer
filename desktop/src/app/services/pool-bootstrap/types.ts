export type PoolBootstrapStatus = "pending" | "inProgress" | "stopped" | "completed" | "failed";

export interface BootstrapSummaryBase {
    accountId: string;
    location: string;
    endpoint: string;
    status: PoolBootstrapStatus;
    stopReason: string | null;
    lastSuccessfulTarget: string | null;
    errors: string[];
}

export interface PerAccountSummary extends BootstrapSummaryBase {
    activitySteps: string[];
}

export interface GlobalSummary extends BootstrapSummaryBase {
    startedAt: string;
    completedAt: string | null;
    activitySteps: string[];
    accounts: PerAccountSummary[];
}
