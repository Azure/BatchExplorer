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
        // tslint:disable:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SubscriptionPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => SubscriptionPickerComponent), multi: true },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionPickerComponent implements ControlValueAccessor, OnDestroy {
    public subscription: FormControl;

    private _propagateChange: (value: any) => void = null;
    private _sub: Subscription;

    constructor(
        public subscriptionService: SubscriptionService,
        private changeDetector: ChangeDetectorRef) {
        this.subscription = new FormControl();
        this._sub = this.subscription.valueChanges.subscribe((subscription) => {
            if (this._propagateChange) {
                this._propagateChange(subscription);
            }
            this.changeDetector.markForCheck();
        });
    }

    public writeValue(value: any): void {
        if (value) {
            this.subscription.setValue(value);
        }
    }

    public registerOnChange(fn: any): void {
        this._propagateChange = fn;
    }

    public registerOnTouched(fn: any): void {
        // Do nothing
    }

    public validate(c: FormControl) {
        return null;
    }

    public ngOnDestroy(): void {
        if (this._sub) {
            this._sub.unsubscribe();
        }
    }

    public trackBySubscriptionId(index, subscription: ArmSubscription) {
        return subscription.id;
    }
}
