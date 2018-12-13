import { DateUtils, exists } from "@batch-flask/utils";
import { Duration } from "luxon";

export class DecoratorBase<TEntity> {
    public original: TEntity;
    public id: string;

    private _maxTimespan: string = "P10675199DT2H48M5.477580699998725S";

    constructor(entity: TEntity) {
        this.original = entity;
        this.id = entity ? (entity as any).id : "";
    }

    protected dateField(value: Date, returnEmptyStringForNullOrUndefined = false): string {
        return value
            ? DateUtils.fullDateAndTime(value)
            : returnEmptyStringForNullOrUndefined ? "" : "n/a";
    }

    protected numberField(value: number | any, returnEmptyStringForNullOrUndefined = false): string {
        return exists(value) ? value as string : returnEmptyStringForNullOrUndefined ? "" : "n/a";
    }

    protected stringField(value: string | any, returnEmptyStringForNullOrUndefined = false): string {
        return exists(value) ? value as string : returnEmptyStringForNullOrUndefined ? "" : "n/a";
    }

    protected timespanField(value?: Duration, returnEmptyStringForNullOrUndefined = false): string {
        return value
            ? this._formatTimespan(value)
            : returnEmptyStringForNullOrUndefined ? "" : "n/a";
    }

    protected booleanField(value: boolean | any, returnEmptyStringForNullOrUndefined = false): string {
        return value
            ? value as string
            : returnEmptyStringForNullOrUndefined ? "" : "n/a";
    }

    // todo: can be moved into a common method when we localize
    protected stateField(state: any): string {
        switch (state) {
            case "invalid":
                return "Invalid";
            case "unmapped":
                return "Unmapped";
            case "upgrading":
                return "Upgrading";
            case "creating":
                return "Creating";
            case "deleting":
                return "Deleting";
            case "resizing":
                return "Resizing";
            case "stopping":
                return "Stopping";
            case "steady":
                return "Steady";
            case "starting":
                return "Starting";
            case "noPoolOrNodeId":
                return "No pool or node";
            case "waitingforstarttask":
                return "Waiting for start task";
            case "starttaskfailed":
                return "Start task failed";
            case "idle":
                return "Idle";
            case "leavingpool":
                return "Leaving pool";
            case "rebooting":
                return "Rebooting";
            case "reimaging":
                return "Reimaging";
            case "running":
                return "Running";
            case "unusable":
                return "Unusable";
            case "doesNotExist":
                return "Doesn't exist";
            case "enabled":
                return "Enabled";
            case "disabled":
                return "Disabled";
            case "active":
                return "Active";
            case "disabling":
                return "Disabling";
            case "terminating":
                return "Terminating";
            case "completed":
                return "Completed";
            case "preparing":
                return "Preparing";
            case "deletefailed":
                return "Delete failed";

            default:
                return this.stringField(state);
        }
    }

    private _formatTimespan(value?: Duration) {
        return value.toString() === this._maxTimespan ? "Unlimited" : DateUtils.prettyDuration(value);
    }
}
