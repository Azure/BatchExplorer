import { Component, Input } from "@angular/core";

import { ServerError } from "@batch-flask/core";

@Component({
    selector: "bl-server-error",
    template: `<div>{{fixMessage}}<ng-content></ng-content></div>`,
})
export class ServerErrorMockComponent {
    @Input()
    public set error(error: ServerError) {
        this._error =  error;
    }
    public get error() { return this._error; }

    private _error: ServerError = null;
}
