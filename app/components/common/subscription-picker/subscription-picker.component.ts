import { ChangeDetectionStrategy, Component, OnDestroy } from "@angular/core";
import { ControlValueAccessor, FormControl } from "@angular/forms";
import { Subscription } from "rxjs";

import { SubscriptionService } from "app/services";
import "./subscription-picker.scss";

@Component({
    selector: "bl-subscription-picker",
    templateUrl: "subscription-picker.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionPickerComponent implements ControlValueAccessor, OnDestroy {
    public subscription: FormControl;

    private _propagateChange: (value: any) => void = null;
    private _sub: Subscription;

    constructor(public subscriptionService: SubscriptionService) {
        this._sub = this.subscription.valueChanges.subscribe((subscription) => {
            if (this._propagateChange) {
                this._propagateChange(subscription);
            }
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
}
