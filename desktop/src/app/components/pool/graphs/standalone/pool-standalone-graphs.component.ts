import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { EntityView } from "@batch-flask/core";
import { Pool } from "app/models";
import { PoolParams, PoolService } from "app/services";

import "./pool-standalone-graphs.scss";

@Component({
    selector: "bl-pool-standalone-graphs",
    templateUrl: "pool-standalone-graphs.html",
})
export class PoolStandaloneGraphsComponent implements OnInit, OnDestroy {
    public static breadcrumb(params, queryParams) {
        return { name: `Pool ${params.poolId} graphs` };
    }

    public poolId: string;
    public pool: Pool;
    private _data: EntityView<Pool, PoolParams>;

    constructor(private route: ActivatedRoute, poolService: PoolService) {
        this._data = poolService.view();
        this._data.item.subscribe((pool) => {
            this.pool = pool;
        });
    }

    public ngOnInit() {
        this.route.params.subscribe(({ poolId }) => {
            this.poolId = poolId;
            this._data.params = { id: poolId };
            this._data.fetch();
        });
    }

    public ngOnDestroy() {
        this._data.dispose();
    }
}
