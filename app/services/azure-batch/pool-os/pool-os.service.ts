import { Injectable } from "@angular/core";
import { exists } from "@batch-flask/utils";
import { NodeAgentSku, NodeAgentSkuAttributes, PoolOsSkus } from "app/models";
import { List } from "immutable";
import { BehaviorSubject, Observable, empty } from "rxjs";
import { expand, filter, map, reduce, share, shareReplay } from "rxjs/operators";
import { AzureBatchHttpService, BatchListResponse } from "../core";

@Injectable()
export class PoolOsService {
    public offers: Observable<PoolOsSkus>;
    public nodeAgentSkus: Observable<List<NodeAgentSku>>;
    private _nodeAgentSkus = new BehaviorSubject<List<NodeAgentSku>>(null);

    constructor(private http: AzureBatchHttpService) {
        this.nodeAgentSkus = this._nodeAgentSkus.pipe(
            filter(x => exists(x)),
        );

        this.offers = this.nodeAgentSkus.pipe(
            map(x => new PoolOsSkus(x)),
            shareReplay(1),
        );
    }

    public init() {
        this.refresh();
    }

    public refresh(): Observable<any> {
        const obs = this._loadNodeAgentSkus();
        obs.subscribe({
            next: (value) => {
                this._nodeAgentSkus.next(List(value));
            },
            error: (error) => {
                this._nodeAgentSkus.error(error);
            },
        });
        return obs;
    }

    private _loadNodeAgentSkus() {
        return this.http.get<BatchListResponse<NodeAgentSkuAttributes>>("/nodeagentskus").pipe(
            expand(response => {
                return response["odata.nextLink"] ? this.http.get(response["odata.nextLink"]) : empty();
            }),
            reduce((resourceGroups, response: BatchListResponse<NodeAgentSkuAttributes>) => {
                return [...resourceGroups, ...response.value];
            }, []),
            map(x => x.map(v => new NodeAgentSku(v))),
            share(),
        );
    }
}
