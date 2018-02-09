import { Component, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Observable, Subscription } from "rxjs";

import { SidebarRef } from "app/components/base/sidebar";
import { autobind } from "app/core";
import { Location, Subscription as ArmSubscription } from "app/models";
import { SubscriptionService } from "app/services";
import { Constants } from "app/utils";

@Component({
    selector: "bl-account-create-basic-dialog",
    templateUrl: "account-create-basic-dialog.html",
})
export class AccountCreateBasicDialogComponent implements OnDestroy {
    public form: FormGroup;
    public locations: Location[] = [];

    private _subscriptionSub: Subscription;
    private _resourceGroupSub: Subscription;
    private _locationSub: Subscription;

    constructor(
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
            location: ["", Validators.required],
            resourceGroup: ["", Validators.required],
            subscriptionId: [null, Validators.required],
        });

        this._subscriptionSub = this.form.controls.subscriptionId.valueChanges.subscribe((subscriptionId: string) => {
            this._disposeSubscription(this._locationSub);
            this._locationSub = this.subscriptionService.listLocations(subscriptionId)
                .subscribe((locations: Location[]) => {
                    this.locations = locations;
                    if (this.locations.length > 0) {
                        // TODO: currently set first element as default,
                        // Better way is get current longitude and latitude, calculate nearest location and populate
                        // this location as default value
                        this.form.controls.value.setValue(this.locations[0].id);
                    }
                });
        });
    }
    public ngOnDestroy(): void {
        this._disposeSubscription(this._subscriptionSub);
        this._disposeSubscription(this._locationSub);
    }

    public trackBySubscriptionId(index, subscription: ArmSubscription) {
        return subscription.id;
    }

    public trackByLocation(index, location: Location) {
        return location.id;
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
