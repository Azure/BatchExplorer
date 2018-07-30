import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TenantDetails, TenantDetailsAttributes } from "app/models";
import { Constants } from "common";
import { Observable } from "rxjs";
import { AdalService } from "./adal";
import { BatchExplorerService } from "./batch-labs.service";

@Injectable()
export class TenantDetailsService {
    public get serviceUrl() {
        return this.batchExplorer.azureEnvironment.aadGraph;
    }

    constructor(private adal: AdalService, private http: HttpClient, private batchExplorer: BatchExplorerService) {

    }

    public get(tenantId: string): Observable<TenantDetails> {
        return this.adal.accessTokenData(tenantId, this.serviceUrl)
            .flatMap((accessToken) => {
                const options = {
                    headers: new HttpHeaders({
                        Authorization: `${accessToken.token_type} ${accessToken.access_token}`,
                    }),
                    params: new HttpParams({
                        fromObject: {
                            "api-version": Constants.ApiVersion.aadGraph,
                        },
                    }),
                };
                const url = `${this.serviceUrl}${tenantId}/tenantDetails`;
                return this.http.get<{ value: TenantDetailsAttributes[] }>(url, options);
            }).map((response) => {
                const value = response.value[0];
                return value && new TenantDetails(value);
            }).share();
    }
}
