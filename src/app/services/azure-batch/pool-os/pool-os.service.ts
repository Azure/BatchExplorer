import { Injectable } from "@angular/core";
import { log } from "@batch-flask/utils";
import { NodeAgentSku, NodeAgentSkuAttributes, PoolOsSkus } from "app/models";
import { BatchAccountService } from "app/services/batch-account";
import { List } from "immutable";
import { Observable, empty, of } from "rxjs";
import {
    catchError, distinctUntilChanged, expand, map, publishReplay, reduce, refCount, share, switchMap,
} from "rxjs/operators";
import { AzureBatchHttpService, BatchListResponse } from "../core";

@Injectable({ providedIn: "root" })
export class PoolOsService {
    public offers: Observable<PoolOsSkus>;
    public nodeAgentSkus: Observable<List<NodeAgentSku>>;

    constructor(private http: AzureBatchHttpService, private accountService: BatchAccountService) {
        this.nodeAgentSkus = this.accountService.currentAccountId.pipe(
            distinctUntilChanged(),
            switchMap(() => {
                return this._loadNodeAgentSkus().pipe(
                    catchError((error) => {
                        log.error("Failed to load node agent skus", error);
                        return of(List<NodeAgentSku>([]));
                    }),
                );
            }),
            publishReplay(1),
            refCount(),
        );

        this.offers = this.nodeAgentSkus.pipe(
            map(x => new PoolOsSkus(x)),
            publishReplay(1),
            refCount(),
        );
    }

    private _loadNodeAgentSkus(): Observable<List<NodeAgentSku>> {
        return this.http.get<BatchListResponse<NodeAgentSkuAttributes>>("/nodeagentskus").pipe(
            expand(response => {
                return response["odata.nextLink"] ? this.http.get(response["odata.nextLink"]) : empty();
            }),
            reduce((resourceGroups, response: BatchListResponse<NodeAgentSkuAttributes>) => {
                return [...resourceGroups, ...response.value];
            }, []),
            map(x => List(x.map(v => new NodeAgentSku(v)))),
            share(),
        );
    }
}
