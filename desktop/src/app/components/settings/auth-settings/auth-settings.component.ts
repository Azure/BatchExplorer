import { ChangeDetectionStrategy, Component, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";

import "./auth-settings.scss";

@Component({
    selector: "be-auth-settings",
    templateUrl: "auth-settings.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthSettingsComponent implements OnDestroy {
    public static breadcrumb() {
        return { name: "AuthSettings" };
    }
    private _destroy = new Subject();
    public saved = false;

    ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }
}
