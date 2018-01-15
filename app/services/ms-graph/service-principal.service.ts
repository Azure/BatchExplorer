import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { MsGraphHttpService } from "./ms-graph-http.service";

@Injectable()
export class ServicePrincipalService {
    constructor(private http: MsGraphHttpService) {
    }

    public get(principalId: string): Observable<any> {
        return this.http.get(`/servicePrincipals/${principalId}`);
    }
}
