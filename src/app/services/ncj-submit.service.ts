import { Injectable } from "@angular/core";
import { NcjJobTemplate, NcjPoolTemplate } from "app/models";
import { Observable } from "rxjs";
import { PythonRpcService } from "./python-rpc";

@Injectable({providedIn: "root"})
export class NcjSubmitService {
    constructor(private pythonRpcService: PythonRpcService) { }

    public submitJob(template: NcjJobTemplate, params: StringMap<any>) {
        return this.pythonRpcService.callWithAuth("submit-ncj-job", [template, params]);
    }

    public createPool(template: NcjPoolTemplate, params: StringMap<any>) {
        return this.pythonRpcService.callWithAuth("create-ncj-pool", [template, params]);
    }

    public expandPoolTemplate(template: NcjPoolTemplate, params: StringMap<any>): Observable<any> {
        return this.pythonRpcService.callWithAuth("expand-ncj-pool", [template, params]);
    }
}
