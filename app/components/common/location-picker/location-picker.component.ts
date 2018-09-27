import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component,
    Input, OnChanges, OnDestroy, forwardRef,
} from "@angular/core";
import {
    AbstractControl, ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator,
} from "@angular/forms";
import { Location, Subscription } from "app/models";
import { Subscription as RxjsSubscription } from "rxjs";

import { LoadingStatus } from "@batch-flask/ui";
import { SubscriptionService } from "../../../services";
import "./location-picker.scss";

@Component({
    selector: "bl-location-picker",
    templateUrl: "location-picker.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => LocationPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => LocationPickerComponent), multi: true },
    ],
})
export class LocationPickerComponent implements OnChanges, OnDestroy, ControlValueAccessor, Validator {
    public LoadingStatus = LoadingStatus;

    @Input() public subscription: Subscription;

    public location = new FormControl();
    public locations: Location[] = [];
    public loadingStatus = LoadingStatus.Loading;
    private _locationSub: RxjsSubscription;
    private _propagateChange: any;

    constructor(private changeDetector: ChangeDetectorRef, private subscriptionService: SubscriptionService) {
        this.location.valueChanges.subscribe((value) => {
            if (this._propagateChange) {
                this._propagateChange(value);
            }
        });
    }

    public ngOnChanges(changes) {
        if (changes.subscription) {
            this._updateLocations();
        }
    }

    public ngOnDestroy() {

    }

    public validate(c: AbstractControl): ValidationErrors {
        return null;
    }

    public writeValue(location: string): void {
        this.location.setValue(location);
    }

    public registerOnChange(fn: any): void {
        this._propagateChange = fn;
    }

    public registerOnTouched(fn: any): void {
        // Nothing
    }

    public trackLocation(index, location: Location) {
        return location.id;
    }

    private _updateLocations() {
        this._disposeSubscription();
        this.loadingStatus = LoadingStatus.Loading;
        this._locationSub = this.subscriptionService.listLocations(this.subscription)
            .subscribe((locations: Location[]) => {
                this.locations = locations;
                this.loadingStatus = LoadingStatus.Ready;
                this.changeDetector.markForCheck();
            });
    }

    private _disposeSubscription() {
        if (this._locationSub) {
            this._locationSub.unsubscribe();
            this._locationSub = null;
        }
    }
}
