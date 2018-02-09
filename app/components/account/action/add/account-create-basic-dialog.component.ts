import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Observable, Subscription } from "rxjs";

import { SidebarRef } from "app/components/base/sidebar";
import { autobind } from "app/core";
import { Location, ResourceGroup, Subscription as ArmSubscription } from "app/models";
import { SubscriptionService } from "app/services";
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
        public subscriptionService: SubscriptionService,
        public sidebarRef: SidebarRef<AccountCreateBasicDialogComponent>) {

        this.form = this.formBuilder.group({
            name: ["", [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(64),
                Validators.pattern(Constants.forms.validation.regex.batchAccount),
                // TODO: Implement name check
            ]],
            location: [null, Validators.required],
            newResourceGroup: [null, Validators.required],
            resourceGroupMode: [ResourceGroupMode.UseExisting, Validators.required],
            resourceGroup: [null, Validators.required],
            subscription: [null, Validators.required],
        });

        this._subs.push(this.form.controls.subscription.valueChanges.subscribe((subscription: ArmSubscription) => {
            this.form.controls.resourceGroup.setValue(null);
            this.form.controls.location.setValue(null);
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
                this.form.controls.location.setValue(this.locations[locationIndex]);
                this.changeDetector.markForCheck();
            }
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

    public get selectedLocation() {
        return this.form.controls.location.value;
    }

    public get accountUrlSuffix() {
        return `.${this.selectedLocation.name}.${accountIdSuffix}`;
    }

    public get selectedResourceGroupMode() {
        return this.form.controls.resourceGroupMode.value;
    }

    public showCollection(array: ResourceGroup[] | Location[]) {
        return array && array.length > 0;
    }

    @autobind()
    public submit(): Observable<any> {
        // const formData = this.form.value;

        return null;
        // return this.accountService.put(formData.id, formData.version)
        //     .cascade((packageVersion) => this._uploadAppPackage(this.file, packageVersion.storageUrl))
        //     .cascade(() => {
        //         return this.accountService.activatePackage(formData.id, formData.version).subscribe({
        //             next: () => {
        //                 this.accountService.onAccountAdded.next(formData.id);
        //                 this.notificationService.success(
        //                     "Account added!",
        //                     `Version ${formData.version} for account '${formData.id}' was successfully created!`,
        //                 );
        //             },
        //             error: (response: Response) => {
        //                 /**
        //                  * Possible errors
        //                  *  - trying to put a package that already exists and has allowUpdates = false
        //                  *      409 (The settings for the specified account forbid package updates.)
        //                  *      code : "AccountDoesntAllowPackageUpdates"
        //                  *      message :
        //                  *          "The settings for the specified account forbid package updates."
        //                  *          RequestId: 0427d452-dbfe-48ff-80f9-680a26bbff27
        //                  *          Time:2017-02-13T03:35:27.0685745Z
        //                  */
        //                 log.error("Failed to activate account package :: ", response);
        //                 this.notificationService.error(
        //                     "Activation failed",
        //                     "The account package was uploaded into storage successfully, "
        //                     + "but the activation process failed.",
        //                 );
        //             },
        //         });
        //     });
    }

    private _disposeSubscription(subscription: Subscription) {
        if (subscription) {
            subscription.unsubscribe();
        }
    }
}
