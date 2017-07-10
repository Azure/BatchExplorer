import { ContainerLease } from "app/models";
import { DecoratorBase } from "app/utils/decorators";

export class ContainerLeaseDecorator extends DecoratorBase<ContainerLease> {
    public status: string;
    public state: string;
    public duration: string;

    constructor(lease: ContainerLease) {
        super(lease);

        this.status = this._leaseStatusField(lease.status);
        this.state = this._leaseStateField(lease.state);
        this.duration = this.stringField(lease.duration);
    }

    private _leaseStatusField(status: any): string {
        switch (status) {
            case "locked":
                return "Locked";
            case "unlocked":
                return "Unlocked";
            case "unspecified":
                return "Unspecified";

            default:
                return this.stringField(status);
        }
    }

    private _leaseStateField(state: any): string {
        switch (state) {
            case "available":
                return "Available";
            case "breaking":
                return "Breaking";
            case "broken":
                return "Broken";
            case "expired":
                return "Expired";
            case "leased":
                return "Leased";
            case "unspecified":
                return "Unspecified";

            default:
                return this.stringField(state);
        }
    }
}
