import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Observable, Subscription } from "rxjs";

import { SidebarRef } from "app/components/base/sidebar";
import { autobind } from "app/core";
import { Location, ResourceGroup, Subscription as ArmSubscription } from "app/models";
import {
    AccountService, AuthorizationHttpService, AvailabilityResult,
    Permission, QuotaResult, SubscriptionService,
} from "app/services";
import { Constants } from "app/utils";
import "./account-create-basic-dialog.scss";

const accountIdSuffix = ".batch.azure.com";

export enum ResourceGroupMode {
    CreateNew = "Create new",
    UseExisting = "Use existing",
}

@Component({
    selector: "bl-account-create-basic-dialog",
    templateUrl: "account-create-basic-dialog.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountCreateBasicDialogComponent implements OnDestroy {
    public ResourceGroupMode = ResourceGroupMode;
    public form: FormGroup;
    public resourceGroups: ResourceGroup[] = [];
    public locations: Location[] = [];

    private _subs: Subscription[] = [];
    private _resourceGroupSub: Subscription;
    private _locationSub: Subscription;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private formBuilder: FormBuilder,
        public accountService: AccountService,
        public authService: AuthorizationHttpService,
        public subscriptionService: SubscriptionService,
        public sidebarRef: SidebarRef<AccountCreateBasicDialogComponent>) {

        this.form = this.formBuilder.group({
            name: [
                "",
                [
                    Validators.required,
                    Validators.minLength(3),
                    Validators.maxLength(64),
                    Validators.pattern(Constants.forms.validation.regex.batchAccount),
                ],
                this._availabilityValidator(),
            ],
            subscription: [
                null,
                Validators.required,
            ],
            location: [
                null,
                Validators.required,
                this._accountQuotaValidator(),
            ],
            resourceGroupMode: [
                ResourceGroupMode.CreateNew,
                Validators.required,
            ],
            newResourceGroup: [
                null,
                [
                    Validators.required,
                    this._newResourceGroupValidator(),
                ],
            ],
            resourceGroup: [null],
        });

        this._subs.push(this.form.controls.subscription.valueChanges.subscribe((subscription: ArmSubscription) => {
            this._setFormValue(this.form.controls.resourceGroup, null);
            this._setFormValue(this.form.controls.location, null);
            this._disposeSubscription(this._resourceGroupSub);
            // List all resource groups
            this._resourceGroupSub = this.subscriptionService.listResourceGroups(subscription)
                .subscribe((resourceGroups: ResourceGroup[]) => {
                    this.resourceGroups = resourceGroups;
                    // List all locations
                    this._disposeSubscription(this._locationSub);
                    this._locationSub = this.subscriptionService.listLocations(subscription)
                        .subscribe((locations: Location[]) => {
                            this.locations = locations;
                            this.changeDetector.markForCheck();
                        });
                    this.changeDetector.markForCheck();
                });
            this.form.controls.name.updateValueAndValidity();
            this.changeDetector.markForCheck();
        }));

        this._subs.push(this.form.controls.resourceGroup.valueChanges.subscribe((resourceGroup: ResourceGroup) => {
            if (!resourceGroup || !this.locations || this.locations.length === 0) {
                return;
            }
            // Note that only set value if there is no value previously selected
            // if location is in the list, set to this location when resource group value changed,
            // otherwise set first item as default location
            if (!this.form.controls.location.value) {
                let locationIndex = this.locations.findIndex(location => location.name === resourceGroup.location);
                locationIndex = locationIndex !== -1 ? locationIndex : 0;
                this._setFormValue(this.form.controls.location, this.locations[locationIndex]);
                this.changeDetector.markForCheck();
            }
        }));

        this._subs.push(this.form.controls.location.valueChanges.subscribe((location: Location) => {
            this.form.controls.name.updateValueAndValidity();
            this.changeDetector.markForCheck();
        }));

        this._subs.push(this.form.controls.resourceGroupMode.valueChanges.subscribe((mode: ResourceGroupMode) => {
            if (mode === ResourceGroupMode.CreateNew) {
                this.form.controls.newResourceGroup.setValidators([
                    Validators.required,
                    this._newResourceGroupValidator(),
                ]);
                this.form.controls.resourceGroup.setValidators(null);
                this.form.controls.resourceGroup.setAsyncValidators(null);
            } else if (mode === ResourceGroupMode.UseExisting) {
                this.form.controls.newResourceGroup.setValidators(null);
                this.form.controls.resourceGroup.setValidators([Validators.required]);
                this.form.controls.resourceGroup.setAsyncValidators([this._resourceGroupPermissionValidator()]);
            }
            this.form.controls.newResourceGroup.updateValueAndValidity();
            this.form.controls.resourceGroup.updateValueAndValidity();
            this.changeDetector.markForCheck();
        }));
    }

    public ngOnDestroy(): void {
        this._subs.forEach(sub => sub.unsubscribe());
        this._disposeSubscription(this._resourceGroupSub);
        this._disposeSubscription(this._locationSub);
    }

    public trackBySubscriptionId(index, subscription: ArmSubscription) {
        return subscription.id;
    }

    public trackByResourceGroup(index, resourceGroup: ResourceGroup) {
        return resourceGroup.id;
    }

    public trackByLocation(index, location: Location) {
        return location.id;
    }

    public get selectedSubscription() {
        return this.form.controls.subscription.value;
    }

    public get selectedLocation() {
        return this.form.controls.location.value;
    }

    public get accountUrlSuffix() {
        return `.${this.selectedLocation.name}.${accountIdSuffix}`;
    }

    public get selectedResourceGroupMode() {
        return this.form.controls.resourceGroupMode.value;
    }

    @autobind()
    public submit(): Observable<any> {
        const formData = this.form.value;
        // console.log(formData);
        return null;
    }

    private _setFormValue(control: AbstractControl, value: any) {
        control.setValue(value);
        if (value) {
            control.markAsTouched();
        } else {
            control.markAsUntouched();
        }
        control.updateValueAndValidity();
    }

    @autobind()
    private _availabilityValidator() {
        return (control: FormControl): Observable<{[key: string]: any}> => {
            const accountName = control.value;
            const subscription = this.form.controls.subscription.value;
            const location = this.form.controls.location.value;
            return this.accountService
                .nameAvailable(accountName, subscription, location && location.name)
                .map((response: AvailabilityResult) => {
                    if (!response || response.nameAvailable) {
                        return null;
                    }
                    return {
                        accountExists: {
                            message: response.message,
                        },
                    };
                })
                .debounceTime(400);
        };
    }

    @autobind()
    private _resourceGroupPermissionValidator() {
        return (control: FormControl): Observable<{[key: string]: any}> => {
            const resourceGroup = control.value;
            if (!resourceGroup) {
                return Observable.of(null);
            }
            return this.authService
                .getPermission(resourceGroup.id)
                .map((response: Permission) => {
                    if (response !== Permission.Write) {
                        return {
                            noPermission: true,
                        };
                    }
                    return null;
                })
                .debounceTime(400);
        };
    }

    @autobind()
    private _newResourceGroupValidator() {
        return (control: FormControl): {[key: string]: any} => {
            if (this.resourceGroups.length === 0) {
                return null;
            }
            if (!control.value) {
                return null;
            }
            // First time enter invalid value won't trigger validation, needs manually set as touched
            control.markAsTouched();
            const index = this.resourceGroups.findIndex(resourceGroup => {
                return resourceGroup.name.toLowerCase() === control.value.toLowerCase();
            });
            return index !== -1 ? {
                resourceGroupExists: true,
            } : null;
        };
    }

    @autobind()
    private _accountQuotaValidator() {
        return (control: FormControl): Observable<{[key: string]: any}> => {
            const location = control.value;
            const subscription = this.form.controls.subscription.value;
            return this.accountService
                .accountQuota(subscription, location && location.name)
                .map((response: QuotaResult) => {
                    if (!response) {
                        return null;
                    }
                    if (response.used < response.quota) {
                        return null;
                    }
                    return {
                        quotaReached: response,
                    };
                })
                .debounceTime(400);
        };
    }

    private _disposeSubscription(subscription: Subscription) {
        if (subscription) {
            subscription.unsubscribe();
        }
    }
}
