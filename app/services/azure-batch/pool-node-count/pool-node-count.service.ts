import { Injectable, OnDestroy } from "@angular/core";
import { Model, Prop, Record } from "@batch-flask/core";
import { log } from "@batch-flask/utils";
import { AccountService } from "app/services/account.service";
import { BehaviorSubject, Observable, Subscription, interval } from "rxjs";
import { expand, map, reduce, share } from "rxjs/operators";
import { AzureBatchHttpService, BatchListResponse } from "../core";

export interface NodeCountsAttributes {
    creating: number;
    idle: number;
    leavingPool: number;
    offline: number;
    preempted: number;
    rebooting: number;
    reimaging: number;
    running: number;
    startTaskFailed: number;
    starting: number;
    total: number;
    unknown: number;
    unusable: number;
    waitingForStartTask: number;
}

interface BatchPoolNodeCounts {
    poolId: string;
    dedicated: NodeCountsAttributes;
    lowPriority: NodeCountsAttributes;
}

@Model()
export class NodeCounts extends Record<NodeCountsAttributes> {
    @Prop() public creating: number;
    @Prop() public idle: number;
    @Prop() public leavingPool: number;
    @Prop() public offline: number;
    @Prop() public preempted: number;
    @Prop() public rebooting: number;
    @Prop() public reimaging: number;
    @Prop() public running: number;
    @Prop() public startTaskFailed: number;
    @Prop() public starting: number;
    @Prop() public total: number;
    @Prop() public unknown: number;
    @Prop() public unusable: number;
    @Prop() public waitingForStartTask: number;

    public get transitioning(): number {
        return this.rebooting + this.reimaging + this.starting + this.creating + this.leavingPool;
    }

    public get error(): number {
        return this.startTaskFailed + this.unknown + this.unusable;
    }
}

@Model()
export class PoolNodeCounts extends Record<any> {
    @Prop() public dedicated: NodeCounts;
    @Prop() public lowPriority: NodeCounts;

    public get total() {
        return this.dedicated.total + this.lowPriority.total;
    }
}

@Injectable()
export class PoolNodeCountService implements OnDestroy {

    /**
     * Observable of a map of the pool node counts. Key is the pool id
     */
    public counts: Observable<Map<string, PoolNodeCounts>>;

    private _counts = new BehaviorSubject(new Map<string, PoolNodeCounts>());
    private _accountSub: Subscription;
    private _pollSub: Subscription;

    constructor(
        accountService: AccountService,
        private http: AzureBatchHttpService) {
        this.counts = this._counts.asObservable();

        this._accountSub = accountService.currentAccountId.subscribe(() => {
            this._counts.next(new Map());
            this.refresh();
        });
        this._startPolling();
    }

    public ngOnDestroy() {
        this._counts.complete();
        this._accountSub.unsubscribe();
        this._pollSub.unsubscribe();
    }

    public countsFor(poolId: string): Observable<PoolNodeCounts | null> {
        return this.counts.pipe(
            map(map => map.get(poolId) || null),
        );
    }

    public refresh(): Observable<any> {
        const obs = this._fetchPoolNodeCounts();
        obs.subscribe({
            next: (value) => {
                this._counts.next(value);
            },
            error: (error) => {
                log.error("Error loading pool node counts", error);
            },
        });
        return obs;
    }

    private _startPolling() {
        this._pollSub = interval(30000).subscribe(() => {
            this.refresh();
        });
    }

    private _fetchPoolNodeCounts(): Observable<Map<string, PoolNodeCounts>> {
        return this.http.get<BatchListResponse<BatchPoolNodeCounts>>("/nodecounts").pipe(
            expand(response => {
                return response["odata.nextLink"] ? this.http.get(response["odata.nextLink"]) : Observable.empty();
            }),
            reduce((resourceGroups, response: BatchListResponse<BatchPoolNodeCounts>) => {
                return [...resourceGroups, ...response.value];
            }, []),
            map((items) => {
                const map = new Map();
                for (const item of items) {
                    map.set(item.poolId, new PoolNodeCounts({
                        dedicated: item.dedicated,
                        lowPriority: item.lowPriority,
                    }));
                }
                return map;
            }),
            share(),
        );
    }
}
