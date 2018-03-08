import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { HttpCode, ServerError,  autobind } from "@batch-flask/core";
import { log } from "@batch-flask/utils";
import { AccountResource, RoleDefinition } from "app/models";
import { AADApplication, PasswordCredential, ServicePrincipal } from "app/models/ms-graph";
import { ResourceAccessService } from "app/services";
import { AADApplicationService, ServicePrincipalService } from "app/services/ms-graph";
import { Observable } from "rxjs";
import "./create-new-aad-app.scss";

export interface AppCreatedEvent {
    application: AADApplication;
    secret: PasswordCredential;
}

const maxRetry = 36;

@Component({
    selector: "bl-create-new-aad-app",
    templateUrl: "create-new-aad-app.html",
})
export class CreateNewAadAppComponent {
    @Input() public account: AccountResource;
    @Output() public appCreated = new EventEmitter<AppCreatedEvent>();
    @Output() public cancel = new EventEmitter<void>();

    public form: FormGroup;
    public set createStatus(status: string) {
        this._createStatus = status;
        this.changeDetector.markForCheck();
    }
    public get createStatus() { return this._createStatus; }
    private _createStatus: string;

    constructor(
        formBuilder: FormBuilder,
        private changeDetector: ChangeDetectorRef,
        private aadApplicationService: AADApplicationService,
        private servicePrincipalService: ServicePrincipalService,
        private resourceAccessService: ResourceAccessService) {
        this.form = formBuilder.group({
            name: ["", Validators.required],
            secretValue: [{}],
        });
    }

    @autobind()
    public create() {
        this.createStatus = "Creating AAD application";
        const value = this.form.value;
        const obs = this.aadApplicationService.create({
            name: value.name,
            secret: value.secretValue,
        }).flatMap((application) => {
            return this._givePermission(application).map(() => application);
        }).shareReplay(1);
        obs.subscribe((application) => {
            const secret = application.passwordCredentials.first();
            this.appCreated.emit({ application, secret });
        });
        return obs;
    }

    public get storageAccountId() {
        const autoStorage = this.account && this.account.autoStorage;
        return autoStorage && autoStorage.storageAccountId;
    }

    private _givePermission(application: AADApplication) {
        this.createStatus = "Creating Service Principal";

        const servicePrincipalObs = this.servicePrincipalService.create({ appId: application.id }).delay(1000);
        const roleObs = this.resourceAccessService.getRoleByName(this.account.id, "Contributor");
        return Observable.forkJoin(servicePrincipalObs, roleObs).flatMap(([servicePrincipal, roleDefinition]) => {
            return this._assignRoles(servicePrincipal, roleDefinition);
        }).do(() => this.createStatus = "AAD Application created successfully.").shareReplay(1);
    }

    private _assignRoles(servicePrincipal: ServicePrincipal, roleDefinition: RoleDefinition) {
        const resources = [this.account.id];
        if (this.storageAccountId) {
            resources.push(this.storageAccountId);
        }

        return Observable.from(resources).concatMap((resourceId) => {
            this.createStatus = "Giving permissions";
            return this._try("Giving permissions", () => {
                return this.resourceAccessService.createAssignment(resourceId, servicePrincipal.id, roleDefinition.id);
            });
        }).last().shareReplay(1);
    }

    private _try(name: string, callback: () => Observable<any>, retryCount = 0) {
        return callback().catch((error: ServerError) => {
            if (!(error.status === HttpCode.BadRequest && error.code === "PrincipalNotFound")) {
                return Observable.throw(error);
            }
            if (retryCount < maxRetry) {
                retryCount++;
                this.createStatus = `${name}: Service Principal is not replicated yet trying again in 5s`
                    + ` (Try ${retryCount + 1}/${maxRetry})`;
                log.info(this.createStatus);
                return Observable.timer(5000)
                    .flatMap(() => this._try(name, callback, retryCount))
                    .shareReplay(1);
            } else {
                // Make it like it succeeded. User can add permissions later
                return Observable.of(null);
            }
        });
    }
}
