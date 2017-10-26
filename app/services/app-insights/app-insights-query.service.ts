import { Injectable } from "@angular/core";
import { AppInsightsTable } from "app/models/app-insights/query-result";
import { Observable } from "rxjs";
import { AppInsightsApiService } from "./app-insights-api.service";

@Injectable()
export class AppInsightsQueryService {
    constructor(private appInsightsApi: AppInsightsApiService) { }

    /**
     * Run the given query and return the result
     * @param query
     */
    public query(appId: string, query: string) {
        return this.appInsightsApi.get(`apps/${appId}/query`, {
            params: {query},
        });
    }

    public getPoolPerformance(appId: string, poolId: string, lastNMinutes: number): Observable<AppInsightsTable> {
        const query = `
            customMetrics
            | where timestamp >= ago(${lastNMinutes}m)
            | where cloud_RoleName == "${poolId}"
            | project name, value, timestamp
            | sort by timestamp asc
        `;
        return this.query(appId, query).map((response) => {
            return response.json().tables[0];
        }).share();
    }
}
