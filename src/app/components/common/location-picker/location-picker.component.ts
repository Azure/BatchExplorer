import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component,
    Input, OnChanges, OnDestroy, forwardRef,
} from "@angular/core";
import {
    ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator,
} from "@angular/forms";
import { isNotNullOrUndefined } from "@batch-flask/core";
import { I18N_NAMESPACE, LoadingStatus } from "@batch-flask/ui";
import { Location, Subscription } from "app/models";
import { ArmLocationService } from "app/services";
import { BehaviorSubject, Subject, combineLatest } from "rxjs";
import { filter, switchMap, tap } from "rxjs/operators";

import "./location-picker.scss";

@Component({
    selector: "bl-location-picker",
    templateUrl: "location-picker.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: I18N_NAMESPACE, useValue: "location-picker" },
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => LocationPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => LocationPickerComponent), multi: true },
    ],
})
export class LocationPickerComponent implements OnChanges, OnDestroy, ControlValueAccessor, Validator {
    public LoadingStatus = LoadingStatus;

    @Input() public subscription: Subscription;
    /**
     * Show location only for the given resources
     */
    @Input() public resourceType?: string;
    public location = new FormControl<string>();
    public locations: Location[] = [];
    public loadingStatus = LoadingStatus.Loading;

    private _subscription = new BehaviorSubject<Subscription | null>(null);
    private _resourceType = new BehaviorSubject<string | null>(null);
    private _destroy = new Subject();
    private _propagateChange: (value: string) => void;

    constructor(private changeDetector: ChangeDetectorRef, private locationService: ArmLocationService) {
        this.location.valueChanges.subscribe((value) => {
            if (this._propagateChange) {
                this._propagateChange(value);
            }
        });

        combineLatest(this._subscription.pipe(filter(isNotNullOrUndefined)), this._resourceType).pipe(
            tap(() => {
                this.loadingStatus = LoadingStatus.Loading;
                this.changeDetector.markForCheck();
            }),
            switchMap(([subscription, resourceType]) => this._fetchLocations(subscription, resourceType)),
        ).subscribe((locations: Location[]) => {
            this.locations = locations;
            this.loadingStatus = LoadingStatus.Ready;
            this.changeDetector.markForCheck();
        });
    }

    public ngOnChanges(changes) {
        if (changes.resourceType) {
            this._resourceType.next(this.resourceType);
        }
        if (changes.subscription) {
            this._subscription.next(this.subscription);
        }
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    public validate(): ValidationErrors {
        if (this.location.valid) {
            return null;
        }
        return this.location.errors;
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

    public trackLocation(_: number, location: Location) {
        return location.id;
    }

    private _fetchLocations(subscription: Subscription, resourceType?: string) {
        if (resourceType) {
            const [provider, resource] = resourceType.split("/");
            return this.locationService.listForResourceType(subscription, provider, resource);
        } else {
            return this.locationService.list(subscription);
        }

    }
}
