import { Injectable, OnDestroy } from "@angular/core";
import { Model, Prop, Record } from "@batch-flask/core";
import { AccountService } from "app/services/account.service";
import { BehaviorSubject, Observable, combineLatest, timer } from "rxjs";
import { expand, flatMap, map, publishReplay, reduce, refCount, share, tap } from "rxjs/operators";
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
export class PoolNodeCounts extends Record<any> implements NodeCountsAttributes {
    @Prop() public dedicated: NodeCounts;
    @Prop() public lowPriority: NodeCounts;

    public get total() {
        return this.dedicated.total + this.lowPriority.total;
    }

    public get creating() {
        return this.dedicated.creating + this.lowPriority.creating;
    }

    public get idle() {
        return this.dedicated.idle + this.lowPriority.idle;
    }

    public get leavingPool() {
        return this.dedicated.leavingPool + this.lowPriority.leavingPool;
    }

    public get offline() {
        return this.dedicated.offline + this.lowPriority.offline;
    }

    public get preempted() {
        return this.dedicated.creating + this.lowPriority.preempted;
    }

    public get rebooting() {
        return this.dedicated.creating + this.lowPriority.rebooting;
    }

    public get reimaging() {
        return this.dedicated.reimaging + this.lowPriority.reimaging;
    }

    public get running() {
        return this.dedicated.running + this.lowPriority.running;
    }

    public get startTaskFailed() {
        return this.dedicated.startTaskFailed + this.lowPriority.startTaskFailed;
    }

    public get starting() {
        return this.dedicated.starting + this.lowPriority.starting;
    }

    public get transitioning() {
        return this.dedicated.transitioning + this.lowPriority.transitioning;
    }

    public get error() {
        return this.dedicated.error + this.lowPriority.error;
    }

    public get unknown() {
        return this.dedicated.unknown + this.lowPriority.unknown;
    }

    public get unusable() {
        return this.dedicated.unusable + this.lowPriority.unusable;
    }

    public get waitingForStartTask() {
        return this.dedicated.waitingForStartTask + this.lowPriority.waitingForStartTask;
    }
}

const NODE_COUNT_REFRESH_INTERVAL = 10000; // 30 seconds

@Injectable()
export class PoolNodeCountService implements OnDestroy {

    /**
     * Observable of a map of the pool node counts. Key is the pool id
     */
    public counts: Observable<Map<string, PoolNodeCounts>>;

    private _counts = new BehaviorSubject(new Map<string, PoolNodeCounts>());

    constructor(
        accountService: AccountService,
        private http: AzureBatchHttpService) {

        this.counts = combineLatest(
            accountService.currentAccountId,
            timer(0, NODE_COUNT_REFRESH_INTERVAL),
        ).pipe(
            flatMap(() => this.refresh()),
            flatMap(() => this._counts),
            publishReplay(),
            refCount(),
        );
    }

    public ngOnDestroy() {
        this._counts.complete();
    }

    public countsFor(poolId: string): Observable<PoolNodeCounts | null> {
        return this.counts.pipe(
            map(map => map.get(poolId) || null),
        );
    }

    public refresh(): Observable<any> {
        return this._fetchPoolNodeCounts().pipe(
            tap((value) => {
                this._counts.next(value);
            }),
        );
    }

    private _fetchPoolNodeCounts(): Observable<Map<string, PoolNodeCounts>> {
        console.log("Fettch more nodes");
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
