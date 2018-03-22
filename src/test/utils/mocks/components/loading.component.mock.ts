import { Component, Input } from "@angular/core";

import { LoadingStatus } from "@batch-flask/ui/loading";

@Component({
    selector: "bl-loading",
    template: `<ng-content></ng-content>`,
})
export class LoadingMockComponent {
    @Input()
    public set status(value: LoadingStatus) {
        this._status = value;
    }
    public get status() {
        return this._status;
    }

    private _status = LoadingStatus.Loading;
}
