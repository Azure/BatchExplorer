import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Observable, Subscription, interval, of } from "rxjs";

import { autobind } from "@batch-flask/core";
import { NotificationService } from "@batch-flask/ui/notifications";
import { Permission } from "@batch-flask/ui/permission";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { log } from "@batch-flask/utils";
import { ArmBatchAccount, BatchAccount, Location, ResourceGroup, Subscription as ArmSubscription } from "app/models";
import { createAccountFormToJsonData } from "app/models/forms/create-account-model";
import {
    ArmBatchAccountService,
    AuthorizationHttpService,
    AvailabilityResult,
    QuotaResult,
    SubscriptionService,
} from "app/services";
import { Constants } from "common";
import { catchError, debounceTime, flatMap, map, retry } from "rxjs/operators";
import "./batch-account-create.scss";

const accountIdSuffix = ".batch.azure.com";

@Component({
    selector: "bl-batch-account-create",
    templateUrl: "batch-account-create.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BatchAccountCreateComponent implements OnDestroy {
    public form: FormGroup;
    public resourceGroups: ResourceGroup[] = [];
    public locations: Location[] = [];
    public title = "Create batch account";

    private _subs: Subscription[] = [];
    private _resourceGroupSub: Subscription;
    private _locationSub: Subscription;

    constructor(
        public accountService: ArmBatchAccountService,
        public authService: AuthorizationHttpService,
        public subscriptionService: SubscriptionService,
        public sidebarRef: SidebarRef<BatchAccountCreateComponent>,
        private changeDetector: ChangeDetectorRef,
        private formBuilder: FormBuilder,
        private notificationService: NotificationService) {
        this.form = this._buildCreateForm();
        this._subs.push(this._subscriptionOnChangeSub());
        this._subs.push(this._resourceGroupOnChangeSub());
        this._subs.push(this._locationOnChangeSub());
    }

    public ngOnDestroy(): void {
        this._subs.forEach(sub => sub.unsubscribe());
        this._disposeSubscription(this._resourceGroupSub);
        this._disposeSubscription(this._locationSub);
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
        return `.${this.selectedLocation.name}${accountIdSuffix}`;
    }

    public get account(): BatchAccount {
        if (this.selectedSubscription && this.selectedLocation) {
            const account = new ArmBatchAccount({
                subscription: this.selectedSubscription,
                location: this.selectedLocation.name,
            } as any);
            return account;
        }
        return null;
    }

    public get isNewResourceGroup(): boolean {
        const resourceGroup = this.form.value.resourceGroup;
        if (!resourceGroup) {
            return false;
        }
        const isNewResourceGroup = (typeof resourceGroup === "string" && !this._containsResourceGroup(resourceGroup));
        this.changeDetector.markForCheck();
        return isNewResourceGroup;
    }

    public displayResourceGroup(resourceGroup: ResourceGroup) {
        return resourceGroup ? resourceGroup.name : resourceGroup;
    }

    @autobind()
    public submit(): Observable<any> {
        const formData = this.form.value;
        const subscription = formData.subscription;

        let resourceGroup = formData.resourceGroup;
        if (!this.isNewResourceGroup) {
            if (typeof resourceGroup !== "string") {
                resourceGroup = resourceGroup.name;
            }
        }

        const accountName = formData.name;
        const body = createAccountFormToJsonData(formData);

        let observable: Observable<any> = null;
        if (this.isNewResourceGroup) {
            observable = this.accountService.putResourcGroup(subscription, resourceGroup, {
                location: formData.location.name,
            }).pipe(
                flatMap(() => this.accountService.create(subscription, resourceGroup, accountName, body)),
            );
        } else {
            observable = this.accountService.create(subscription, resourceGroup, accountName, body);
        }
        observable.subscribe({
            next: () => {
                const accountUri = this.accountService.getAccountId(subscription, resourceGroup, accountName);
                // poll account every 1.5 sec to check whether it has been created
                const sub = interval(1500).pipe(
                    flatMap(() => this.accountService.get(accountUri)),
                    retry(),
                ).subscribe(response => {
                    const message = `Batch account '${accountName}' was successfully created!`;
                    this.notificationService.success("Create batch account", message, { persist: true });
                    sub.unsubscribe();
                });
            },
            error: (response: Response) => {
                log.error("Failed to create batch account:: ", response);
                this.notificationService.error(
                    "Creating batch account failed",
                    `Failed to create batch account ${accountName} for resource group ${resourceGroup}`,
                );
            },
        });
        return observable;
    }

    private _buildCreateForm() {
        return this.formBuilder.group({
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
            resourceGroup: [
                null,
                Validators.required,
                this._resourceGroupPermissionValidator(),
            ],
            location: [
                null,
                Validators.required,
                this._accountQuotaValidator(),
            ],
            storageAccountId: [null],
        });
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

    private _subscriptionOnChangeSub(): Subscription {
        return this.form.controls.subscription.valueChanges.subscribe((subscription: ArmSubscription) => {
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
        });
    }

    private _resourceGroupOnChangeSub(): Subscription {
        return this.form.controls.resourceGroup.valueChanges.subscribe((resourceGroup: ResourceGroup | string) => {
            if (!resourceGroup || !this.locations || this.locations.length === 0) {
                return;
            }
            if (typeof resourceGroup === "string") {
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
        });
    }

    private _locationOnChangeSub(): Subscription {
        return this.form.controls.location.valueChanges.subscribe((location: Location) => {
            this.form.controls.name.updateValueAndValidity();
            this.changeDetector.markForCheck();
        });
    }

    @autobind()
    private _availabilityValidator() {
        return (control: FormControl): Observable<{ [key: string]: any }> => {
            const accountName = control.value;
            const subscription = this.form.controls.subscription.value;
            const location = this.form.controls.location.value;
            return this.accountService
                .nameAvailable(accountName, subscription, location && location.name).pipe(
                    map((response: AvailabilityResult) => {
                        if (!response || response.nameAvailable) {
                            return null;
                        }
                        return {
                            accountExists: {
                                message: response.message,
                            },
                        };
                    }),
                    catchError(err => {
                        return of({
                            serverError: err && err.message,
                        });
                    }),
                    debounceTime(400),
                );
        };
    }

    @autobind()
    private _resourceGroupPermissionValidator() {
        return (control: FormControl): Observable<{ [key: string]: any }> => {
            let resourceGroup = control.value;
            if (!resourceGroup) {
                return of(null);
            }
            if (typeof resourceGroup === "string") {
                if (this._containsResourceGroup(resourceGroup)) {
                    resourceGroup = this.resourceGroups.find(rg => rg.name === resourceGroup);
                } else {
                    return of(null);
                }
            }
            return this.authService.getPermission(resourceGroup.id).pipe(
                map((response: Permission) => {
                    if (response !== Permission.Write) {
                        return {
                            noPermission: true,
                        };
                    }
                    return null;
                }),
                catchError(err => {
                    return of({
                        serverError: err && err.message,
                    });
                }),
                debounceTime(400),
            );
        };
    }

    @autobind()
    private _accountQuotaValidator() {
        return (control: FormControl): Observable<{ [key: string]: any }> => {
            const location = control.value;
            const subscription = this.form.controls.subscription.value;
            return this.accountService.accountQuota(subscription, location && location.name).pipe(
                map((response: QuotaResult) => {
                    if (!response || !response.quota) {
                        return null;
                    }
                    if (response.used < response.quota) {
                        return null;
                    }
                    return {
                        quotaReached: response,
                    };
                }),
                catchError(err => {
                    return of({
                        serverError: err && err.message,
                    });
                }),
                debounceTime(400),
            );
        };
    }

    private _containsResourceGroup(resourceGroup: string) {
        const index = this.resourceGroups.findIndex(rg => {
            return rg.name.toLowerCase() === resourceGroup.toLowerCase();
        });
        return index !== -1;
    }

    private _disposeSubscription(subscription: Subscription) {
        if (subscription) {
            subscription.unsubscribe();
        }
    }
}
