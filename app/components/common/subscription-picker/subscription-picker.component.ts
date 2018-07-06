import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, forwardRef } from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Subscription } from "rxjs";

import { Subscription as ArmSubscription } from "app/models";
import { SubscriptionService } from "app/services";
import "./subscription-picker.scss";

@Component({
    selector: "bl-subscription-picker",
    templateUrl: "subscription-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SubscriptionPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => SubscriptionPickerComponent), multi: true },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionPickerComponent implements ControlValueAccessor, OnDestroy {
    public subscription = new FormControl<ArmSubscription>();
    public subscriptionList: ArmSubscription[];

    private _propagateChange: (value: ArmSubscription) => void = null;
    private _subs: Subscription[] = [];

    constructor(
        public subscriptionService: SubscriptionService,
        private changeDetector: ChangeDetectorRef) {

        this._subs.push(this.subscriptionService.subscriptions.subscribe((subscriptions) => {
            this.subscriptionList = subscriptions.toArray();
            this.changeDetector.markForCheck();
        }));

        this._subs.push(this.subscription.valueChanges.subscribe((subscription: ArmSubscription) => {
            if (this._propagateChange) {
                this._propagateChange(subscription);
            }
        }));
    }

    public writeValue(value: ArmSubscription): void {
        if (value) {
            this.subscription.setValue(value);
        }
    }

    public registerOnChange(fn: (value: ArmSubscription) => void): void {
        this._propagateChange = fn;
    }

    public registerOnTouched(fn: any): void {
        // Do nothing
    }

    public validate(c: FormControl) {
        return null;
    }

    public ngOnDestroy(): void {
        if (this._subs) {
            this._subs.forEach((sub) => sub.unsubscribe());
        }
    }

    public trackBySubscriptionId(_, subscription: ArmSubscription) {
        return subscription.id;
    }
}
