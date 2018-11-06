import { ContainerLease, LeaseState, LeaseStatus } from "app/models";
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

    private _leaseStatusField(status: LeaseStatus): string {
        switch (status) {
            case LeaseStatus.locked:
                return "Locked";
            case LeaseStatus.unlocked:
                return "Unlocked";
            case LeaseStatus.unspecified:
                return "Unspecified";

            default:
                return this.stringField(status);
        }
    }

    private _leaseStateField(state: LeaseState): string {
        switch (state) {
            case LeaseState.available:
                return "Available";
            case LeaseState.breaking:
                return "Breaking";
            case LeaseState.broken:
                return "Broken";
            case LeaseState.expired:
                return "Expired";
            case LeaseState.leased:
                return "Leased";
            case LeaseState.unspecified:
                return "Unspecified";

            default:
                return this.stringField(state);
        }
    }
}
